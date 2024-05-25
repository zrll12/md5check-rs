use lazy_static::lazy_static;
use moka::sync::Cache;
use threads_pool::{block_on, Config, ConfigStatus, ThreadPool, TimeoutPolicy};
use crate::check::md5::MD5Checker;

mod md5;
mod blake3;

lazy_static!{
    static ref THREAD_CACHE: Cache<String, bool> = Cache::builder().build();
    static ref THREAD_POOL: ThreadPool = ThreadPool::new(3);
}

#[tauri::command]
pub async fn sum_md5(app_handle: tauri::AppHandle, name: String, event: String) -> Result<(), String> {
    THREAD_CACHE.insert(event.to_string(), true);
    let file_name = std::path::Path::new(Box::leak(name.clone().into_boxed_str())).file_name().unwrap().to_str().unwrap();
    let mut file = std::fs::File::open(&name).map_err(|e| e.to_string())?;
    THREAD_POOL.execute(move || {
        block_on(file.check_md5(app_handle, file_name.to_string(), event.to_string())).unwrap();
    }).unwrap();
    Ok(())
}

#[tauri::command]
pub async fn stop_sum(event: &str) -> Result<(), ()> {
    THREAD_CACHE.remove(event);
    Ok(())
}
