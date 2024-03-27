FROM degroote22/lmscript-runpod-serverless:0.0.9

RUN sudo apt-get install jq

ADD start-docker.sh /start-docker.sh
RUN chmod +x /start-docker.sh

CMD ["/start-docker.sh"]