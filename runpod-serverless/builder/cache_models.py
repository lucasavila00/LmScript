from huggingface_hub import snapshot_download

if __name__ == "__main__":
    path = snapshot_download(repo_id="TheBloke/Mistral-7B-Instruct-v0.2-AWQ")
    with open("path.txt", "w") as f:
        f.write(path)
    print(path)
