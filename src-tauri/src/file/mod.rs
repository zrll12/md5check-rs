use rfd::AsyncFileDialog;
use serde::{Deserialize, Serialize};

#[tauri::command]
pub async fn get_md5_list() -> Result<String, String> {
    let file = AsyncFileDialog::new()
        .add_filter("md5", &["md5"]).pick_file().await.ok_or("No file selected")?;
    Ok(file.path().canonicalize().unwrap().to_str().unwrap().to_string())
}

#[tauri::command]
pub async fn get_file_size(file: String) -> Result<String, String> {
    let file_instance = std::fs::File::open(&file).map_err(|e| e.to_string())?;
    let size = file_instance.metadata().unwrap().len();

    Ok(format!("{size}"))
}

#[tauri::command]
pub async fn get_new_file() -> Result<String, String> {
    let file = AsyncFileDialog::new().pick_file().await.ok_or("No file selected")?;
    Ok(file.path().canonicalize().unwrap().to_str().unwrap().to_string())
}
