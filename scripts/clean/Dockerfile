# A machine that has never seen night-shift: Node and git, nothing else. `npm run check:clean`
# builds it and runs smoke.sh inside, as an ordinary user with an empty home folder.
FROM node:24-bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates curl \
  && rm -rf /var/lib/apt/lists/*
RUN useradd --create-home stranger
USER stranger
WORKDIR /home/stranger
COPY --chown=stranger smoke.sh /home/stranger/smoke.sh
ENTRYPOINT ["sh", "/home/stranger/smoke.sh"]
