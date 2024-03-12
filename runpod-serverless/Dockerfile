FROM runpod/base:0.6.1-cuda12.1.0

ARG BASE_PATH="/runpod-volume"

ENV BASE_PATH=$BASE_PATH \
    HF_DATASETS_CACHE="${BASE_PATH}/huggingface-cache/datasets" \
    HUGGINGFACE_HUB_CACHE="${BASE_PATH}/huggingface-cache/hub" \
    HF_HOME="${BASE_PATH}/huggingface-cache/hub" \
    HF_TRANSFER=1

COPY builder/requirements.txt /requirements.txt
RUN python3.11 -m pip install -r /requirements.txt --no-cache-dir && \
    rm /requirements.txt

COPY builder/download_model.py /download_model.py
RUN python3.11 /download_model.py

RUN git clone https://github.com/sgl-project/sglang.git
RUN cd sglang && git checkout b2eb080501b4b4a0d72eb5a0e6be30d43811dcbd && python3.11 -m pip install --upgrade pip && python3.11 -m pip install -e "python[all]"

RUN python3.11 -m pip install https://github.com/flashinfer-ai/flashinfer/releases/download/v0.0.2/flashinfer-0.0.2+cu121torch2.1-cp311-cp311-linux_x86_64.whl

# Required for RTX 2070, not required for A4000, A5000
RUN pip install "triton>=2.2.0"
# Replace with the following line to install the latest nightly version, required for even older gpus
# RUN python3.11 -m pip install -U --index-url https://aiinfra.pkgs.visualstudio.com/PublicPackages/_packaging/Triton-Nightly/pypi/simple/ triton-nightly


ADD src .

ADD start-docker.sh /start-docker.sh
RUN chmod +x /start-docker.sh

CMD ["/start-docker.sh"]