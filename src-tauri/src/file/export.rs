use std::path::PathBuf;
use rfd::FileHandle;

pub async fn save_hashes(files: Vec<(PathBuf, String)>, file: FileHandle) {
    let mut data = String::new();

    for (path, hash) in files {
        data += format!("{hash} *{}\n", path.to_str().unwrap()).as_str();
    }

    file.write(data.as_bytes()).await.unwrap();
}
