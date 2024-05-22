mod export;

use std::panic::panic_any;
use std::path::{Path, PathBuf};
use relative_path::{PathExt, RelativePathBuf};
use rfd::AsyncFileDialog;
use crate::file::export::save_hashes;

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
pub async fn get_new_file() -> Result<Vec<String>, String> {
    let file = AsyncFileDialog::new().pick_files().await.ok_or("No file selected")?;
    let file = file.iter().map(|e| e.path().canonicalize().unwrap().to_str().unwrap().to_string()).collect();
    Ok(file)
}

#[tauri::command]
pub async fn export(files: Vec<(String, String)>) -> Result<(), String> {
    let file = AsyncFileDialog::new().add_filter("md5", &["md5"]).save_file().await.ok_or("No file selected.")?;

    let file_path = file.path().parent().unwrap();
    let files: Vec<(PathBuf, String)> = files.iter()
        .map(|(path, md5)| {(Path::new(path).relative_to(file_path).unwrap().to_path(""), md5.clone())}).collect();

    save_hashes(files, file).await;

    Ok(())
}
