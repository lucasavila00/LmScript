FROM runpod/base:0.6.1-cuda12.1.0

COPY builder/requirements.txt /requirements.txt
RUN python3.11 -m pip install -r /requirements.txt --no-cache-dir && \
    rm /requirements.txt

# Cache Models
COPY builder/cache_models.py /cache_models.py
RUN python3.11 /cache_models.py && \
    rm /cache_models.py

RUN python3.11 -m pip install flashinfer -i https://flashinfer.ai/whl/cu121/torch2.1/

# Required for RTX 2070, not required for A4000, A5000
RUN pip install "triton>=2.2.0"
# Replace with the following line to install the latest nightly version, required for even older gpus
# RUN python3.11 -m pip install -U --index-url https://aiinfra.pkgs.visualstudio.com/PublicPackages/_packaging/Triton-Nightly/pypi/simple/ triton-nightly

ADD src .

ADD start-docker.sh /start-docker.sh
RUN chmod +x /start-docker.sh

CMD ["/start-docker.sh"]