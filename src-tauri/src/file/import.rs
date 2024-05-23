use std::path::PathBuf;

use rfd::FileHandle;

pub async fn import_file(file: FileHandle) -> Result<Vec<(String, String)>, String> {
    let content = String::from_utf8(file.read().await).unwrap();
    let base_path = PathBuf::from(file).parent().unwrap().canonicalize().unwrap();
    let mut result = Vec::new();

    let content = content.split("\n");

    for line in content {
        if line.is_empty() {
            continue;
        }
        let line_content = deserialize_line(line).map_err(|_| "Failed to deserialize".to_string())?;
        let path = PathBuf::from(line_content.1);
        let mut final_path = base_path.clone();
        final_path.push(path);
        println!("Adding file: {final_path:?}");
        result.push((line_content.0, final_path.canonicalize().unwrap().to_str().unwrap().to_string()));
    }

    Ok(result)
}

fn deserialize_line(line: &str) -> Result<(String, String), ()> {
    let line_content = if line.split(" *").collect::<Vec<&str>>().len() == 2 {
        line.split(" *").collect::<Vec<&str>>()
    } else if line.split("|").collect::<Vec<&str>>().len() == 2 {
        line.split("|").collect()
    } else if line.split("  ").collect::<Vec<&str>>().len() == 2 {
        line.split("  ").collect()
    } else {
        return Err(());
    };

    Ok((line_content.get(0).unwrap().trim().to_string().to_uppercase(), line_content.get(1).unwrap().trim().to_string()))
}
