use lazy_static::lazy_static;
use moka::sync::Cache;
use crate::check::md5::MD5Checker;

mod md5;

lazy_static!{
    static ref THREAD_CACHE: Cache<String, bool> = Cache::new(3);
}

#[tauri::command]
pub async fn sum_md5(app_handle: tauri::AppHandle, name: &str, event: &str) -> Result<String, String> {
    THREAD_CACHE.insert(event.to_string(), true);
    let path = std::path::Path::new(name);
    let mut file = std::fs::File::open(name).map_err(|e| e.to_string())?;
    Ok(file.check_md5(app_handle, path.file_name().unwrap().to_str().unwrap(), event).await)
}

#[tauri::command]
pub async fn stop_sum(event: &str) -> Result<(), ()> {
    THREAD_CACHE.remove(event);
    Ok(())
}
