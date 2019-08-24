#!/bin/bash
echo "Make Bootstrap Script Running..."
send-cli stop
sleep 10
echo "Social Send daemon stopped"
echo "Zipping..."
#cp /root/Dropbox/peers.dat /root/.send/peers.dat
chmod 666 /root/.send/peers.dat
cd /root/.send
zip bootstrap.zip blocks/* blocks/index/* chainstate/* peers.dat
mv -f bootstrap.zip /root/Dropbox/bootstrap.zip
echo "Zip complete.. Restarting Send Daemon"
sendd &
echo "Finish."
