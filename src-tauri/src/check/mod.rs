use crate::check::md5::MD5Checker;

mod md5;

#[tauri::command]
pub async fn sum_md5(app_handle: tauri::AppHandle, name: &str) -> Result<String, String> {
    let path = std::path::Path::new(name);
    let mut file = std::fs::File::open(name).map_err(|e| e.to_string())?;
    Ok(file.check_md5(app_handle, path.file_name().unwrap().to_str().unwrap()).await)
}
