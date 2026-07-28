use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::sync::OnceLock;
use sysinfo::System;

fn is_thunderbird_running() -> bool {
    let mut system = System::new();
    system.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
    system.processes().values().any(|process| {
        process
            .name()
            .to_string_lossy()
            .to_lowercase()
            .contains("thunderbird")
    })
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub key: String,
    pub name: String,
    pub color: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadedTags {
    pub tags: Vec<Tag>,
    pub other_lines: Vec<String>,
    pub exists: bool,
}

fn tag_line_regex() -> &'static Regex {
    static RE: OnceLock<Regex> = OnceLock::new();
    RE.get_or_init(|| {
        Regex::new(r#"^user_pref\("mailnews\.tags\.(.+)\.(tag|color)",\s*"(.*)"\);\s*$"#).unwrap()
    })
}

fn unescape_pref_value(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    let mut chars = value.chars();
    while let Some(c) = chars.next() {
        if c == '\\' {
            match chars.next() {
                Some('"') => out.push('"'),
                Some('\\') => out.push('\\'),
                Some(other) => {
                    out.push('\\');
                    out.push(other);
                }
                None => out.push('\\'),
            }
        } else {
            out.push(c);
        }
    }
    out
}

fn escape_pref_value(value: &str) -> String {
    value.replace('\\', "\\\\").replace('"', "\\\"")
}

fn parse_user_js(contents: &str) -> (Vec<Tag>, Vec<String>) {
    let re = tag_line_regex();
    let mut order: Vec<String> = Vec::new();
    let mut names: HashMap<String, String> = HashMap::new();
    let mut colors: HashMap<String, String> = HashMap::new();
    let mut other_lines: Vec<String> = Vec::new();

    for line in contents.lines() {
        if let Some(caps) = re.captures(line.trim_end()) {
            let key = caps.get(1).unwrap().as_str().to_string();
            let prop = caps.get(2).unwrap().as_str();
            let value = unescape_pref_value(caps.get(3).unwrap().as_str());
            if !order.contains(&key) {
                order.push(key.clone());
            }
            if prop == "tag" {
                names.insert(key, value);
            } else {
                colors.insert(key, value);
            }
        } else {
            other_lines.push(line.to_string());
        }
    }

    let tags = order
        .into_iter()
        .map(|key| Tag {
            name: names.get(&key).cloned().unwrap_or_default(),
            color: colors
                .get(&key)
                .cloned()
                .unwrap_or_else(|| "#000000".to_string()),
            key,
        })
        .collect();

    (tags, other_lines)
}

fn render_user_js(tags: &[Tag], other_lines: &[String]) -> String {
    let mut out = String::new();

    for line in other_lines {
        out.push_str(line);
        out.push('\n');
    }
    if !other_lines.is_empty() && !tags.is_empty() {
        out.push('\n');
    }

    for tag in tags {
        out.push_str(&format!(
            "user_pref(\"mailnews.tags.{}.tag\", \"{}\");\n",
            tag.key,
            escape_pref_value(&tag.name)
        ));
        out.push_str(&format!(
            "user_pref(\"mailnews.tags.{}.color\", \"{}\");\n",
            tag.key,
            escape_pref_value(&tag.color)
        ));
    }

    out
}

#[tauri::command]
pub fn load_tags(path: String) -> Result<LoadedTags, String> {
    let file_path = Path::new(&path);
    if !file_path.exists() {
        return Ok(LoadedTags {
            tags: vec![],
            other_lines: vec![],
            exists: false,
        });
    }
    let contents = fs::read_to_string(file_path).map_err(|e| e.to_string())?;
    let (tags, other_lines) = parse_user_js(&contents);
    Ok(LoadedTags {
        tags,
        other_lines,
        exists: true,
    })
}

fn strip_deleted_tag_lines(contents: &str, deleted_keys: &[String]) -> Option<String> {
    if deleted_keys.is_empty() {
        return None;
    }
    let re = tag_line_regex();
    let mut changed = false;
    let mut out = String::with_capacity(contents.len());

    for line in contents.lines() {
        if let Some(caps) = re.captures(line.trim_end()) {
            let key = caps.get(1).unwrap().as_str();
            if deleted_keys.iter().any(|k| k == key) {
                changed = true;
                continue;
            }
        }
        out.push_str(line);
        out.push('\n');
    }

    if changed {
        Some(out)
    } else {
        None
    }
}

#[tauri::command]
pub fn save_tags(
    path: String,
    tags: Vec<Tag>,
    other_lines: Vec<String>,
    deleted_keys: Vec<String>,
) -> Result<(), String> {
    if is_thunderbird_running() {
        return Err(
            "Thunderbird está abierto. Cerralo y volvé a guardar para evitar que sobreescriba los cambios.".to_string(),
        );
    }

    let rendered = render_user_js(&tags, &other_lines);
    let user_js_path = Path::new(&path);
    fs::write(user_js_path, rendered).map_err(|e| e.to_string())?;

    if !deleted_keys.is_empty() {
        if let Some(prefs_file) = user_js_path.parent().map(|dir| dir.join("prefs.js")) {
            if prefs_file.exists() {
                let contents = fs::read_to_string(&prefs_file).map_err(|e| e.to_string())?;
                if let Some(updated) = strip_deleted_tag_lines(&contents, &deleted_keys) {
                    fs::write(&prefs_file, updated).map_err(|e| e.to_string())?;
                }
            }
        }
    }

    Ok(())
}
