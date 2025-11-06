FROM dorowu/ubuntu-desktop-lxde-vnc:latest

ENV DEBIAN_FRONTEND=noninteractive

# --- Remove any stale Chrome repo (prevents GPG error) ---
RUN rm -f /etc/apt/sources.list.d/google-chrome.list && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# --- Core tools ---
RUN apt-get update && \
    apt-get install -y wget curl gnupg ca-certificates fonts-liberation keyboard-configuration && \
    rm -rf /var/lib/apt/lists/*

# --- Install Chromium (Debian package, no Snap) ---
RUN rm -f /usr/bin/google-chrome && \
    wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -O /tmp/chrome.deb && \
    apt-get update && \
    apt-get install -y /tmp/chrome.deb && \
    rm -rf /tmp/chrome.deb && \
    ln -sf /usr/bin/google-chrome-stable /usr/bin/google-chrome && \
    echo "alias chromium='google-chrome-stable --no-sandbox --disable-gpu'" >> /root/.bashrc

# --- Install Node.js (LTS) ---
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    node -v && npm -v

# --- Desktop shortcuts ---
RUN mkdir -p /root/Desktop && \
    echo "[Desktop Entry]\n\
Type=Application\n\
Name=Google Chrome\n\
Exec=google-chrome-stable --no-sandbox --disable-gpu\n\
Icon=google-chrome\n\
Terminal=false\n\
Categories=Network;\n\
" > /root/Desktop/google-chrome.desktop && \
    echo "[Desktop Entry]\n\
Type=Application\n\
Name=LXTerminal\n\
Exec=lxterminal\n\
Icon=utilities-terminal\n\
Terminal=false\n\
Categories=System;\n\
" > /root/Desktop/lxterminal.desktop && \
    chmod +x /root/Desktop/*.desktop

# --- Clipboard & bilingual keyboard layout ---
RUN sed -i 's/disableClipboard = true/disableClipboard = false/' /usr/lib/web/novnc/app/ui.js || true && \
echo '@setxkbmap -layout "us,il" -option "grp:alt_shift_toggle"' >> /etc/xdg/lxsession/LXDE/autostart

# --- Copy project and install dependencies ---
COPY myfolder /root/Desktop/myfolder
WORKDIR /root/Desktop/myfolder
RUN npm install
# Ensure Puppeteer installs Chrome into the right cache path
# RUN mkdir -p /root/.cache/puppeteer && \
#     PUPPETEER_CACHE_DIR=/root/.cache/puppeteer npx puppeteer browsers install chrome
RUN npx puppeteer browsers install chrome

# --- Create desktop shortcut to run Puppeteer ---
RUN mkdir -p /root/Desktop && \
echo "[Desktop Entry]\n\
Type=Application\n\
Name=Run Puppeteer\n\
Exec=lxterminal -e bash -c 'cd /root/Desktop/myfolder && node main.js; exec bash'\n\
Icon=utilities-terminal\n\
Terminal=false\n\
Categories=Utility;\n\
" > /root/Desktop/run-puppeteer.desktop && \
chmod +x /root/Desktop/run-puppeteer.desktop

# --- Ports & volume ---
EXPOSE 5900 80 3000
VOLUME ["/root"]

# --- Defaults ---
ENV ENABLE_CLIPBOARD=true \
    KEYBOARD_LAYOUT="us,il"
ENV DISPLAY_WIDTH=0 \
    DISPLAY_HEIGHT=0 \
    ENABLE_AUTOSCALE=true

# --- Keep original startup process ---
CMD ["/startup.sh"]
