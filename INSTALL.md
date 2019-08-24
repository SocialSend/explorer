Iquidus Explorer - Install Guide
================

### Requires

*  node.js >= 0.10.28
*  mongodb 2.6.x
*  *coind

### Create database

Enter MongoDB cli:

    $ mongo

Create databse:

    > use explorerdb

Create user with read/write access:

    > db.createUser( { user: "iquidus", pwd: "3xp!0reR", roles: [ "readWrite" ] } )

*note: If you're using mongo shell 2.4.x, use the following to create your user:

    > db.addUser( { user: "username", pwd: "password", roles: [ "readWrite"] })

### Get the source

    git clone https://github.com/SocialSend/explorer explorer

### Install node modules

    cd explorer && npm install --production

### Configure

    cp ./settings.json.template ./settings.json

*Make required changes in settings.json*

### Start Explorer

    npm start

*note: mongod must be running to start the explorer*

As of version 1.4.0 the explorer defaults to cluster mode, forking an instance of its process to each cpu core. This results in increased performance and stability. Load balancing gets automatically taken care of and any instances that for some reason die, will be restarted automatically. For testing/development (or if you just wish to) a single instance can be launched with

    node --stack-size=10000 bin/instance

To stop the cluster you can use

    npm stop

### Syncing databases with the blockchain

sync.js (located in scripts/) is used for updating the local databases. This script must be called from the explorers root directory.

    Usage: node scripts/sync.js [database] [mode]

    database: (required)
    index [mode] Main index: coin info/stats, transactions & addresses
    market       Market data: summaries, orderbooks, trade history & chartdata

    mode: (required for index database only)
    update       Updates index from last sync to current block
    check        checks index for (and adds) any missing transactions/addresses
    reindex      Clears index then resyncs from genesis to current block

    notes:
    * 'current block' is the latest created block when script is executed.
    * The market database only supports (& defaults to) reindex mode.
    * If check mode finds missing data(ignoring new data since last sync),
      index_timeout in settings.json is set too low.


*It is recommended to have this script launched via a cronjob at 1+ min intervals.*

**crontab**

*Example crontab; update index every minute and market data every 2 minutes*

    */1 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js index update > /dev/null 2>&1
    */2 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/sync.js market > /dev/null 2>&1
    */5 * * * * cd /path/to/explorer && /usr/bin/nodejs scripts/peers.js > /dev/null 2>&1

### Wallet

Iquidus Explorer is intended to be generic so it can be used with any wallet following the usual standards. The wallet must be running with atleast the following flags

    -daemon -txindex

### Known Issues

**script is already running.**

If you receive this message when launching the sync script either a) a sync is currently in progress, or b) a previous sync was killed before it completed. If you are certian a sync is not in progress remove the index.pid from the tmp folder in the explorer root directory.

    rm tmp/index.pid

**exceeding stack size**

    RangeError: Maximum call stack size exceeded

Nodes default stack size may be too small to index addresses with many tx's. If you experience the above error while running sync.js the stack size needs to be increased.

To determine the default setting run

    node --v8-options | grep -B0 -A1 stack_size

To run sync.js with a larger stack size launch with

    node --stack-size=[SIZE] scripts/sync.js index update

Where [SIZE] is an integer higher than the default.

*note: SIZE will depend on which blockchain you are using, you may need to play around a bit to find an optimal setting*

### Running

# Install service for MongoDB

Create service file

    sudo nano /lib/systemd/system/mongodb.service

File content:

    [Unit]
    Description=High-performance, schema-free document-oriented database
    After=network.target
    Documentation=https://docs.mongodb.org/manual

    [Service]
    User=mongodb
    Group=mongodb
    ExecStart=/usr/bin/mongod --quiet --config /etc/mongod.conf
    # file size
    LimitFSIZE=infinity
    # cpu time
    LimitCPU=infinity
    # virtual memory size
    LimitAS=infinity
    # open files
    LimitNOFILE=64000
    # processes/threads
    LimitNPROC=64000
    # locked memory
    LimitMEMLOCK=infinity
    # total threads (user+kernel)
    TasksMax=infinity
    TasksAccounting=false
    Restart=on-failure

    [Install]
    WantedBy=multi-user.target


Install Service

    sudo systemctl enable mongodb.service

Start Service

    sudo systemctl start mongodb

# Install Forever to keep the js running

    sudo npm install forever -g
    sudo npm install forever-monitor

Start the Explorer

    forever start bin/cluster

Stop the Explorer
    
    killall nodejs

Add this line on /etc/crontab to start explorer when system startup

    @reboot cd /path/to/explorer && /usr/local/bin/forever start bin/cluster > /dev/null 2>&1

### Automatic Bootstrap

Install ZIP

    sudo apt-get install -y zip

Copy makeBootstrap to cron.daily folder

    sudo cp makeBootstrap /etc/cron.daily

Give run permission

    sudo chown root:root /etc/cron.daily/makeBootstrap
    sudo chmod +x /etc/cron.daily/makeBootstrap

Create Dropbox folder

    sudo mkdir /root/Dropbox

Install Dropbox

    cd ~ && wget -O - "https://www.dropbox.com/download?plat=lnx.x86_64" | tar xzf -
    ~/.dropbox-dist/dropboxd

Visit the link and connect this computer with your dropbox account

Download dropbox script

    cd ~ && wget https://www.dropbox.com/download?dl=packages/dropbox.py -O dropbox.py
    chmod +x dropbox.py
    ./dropbox.py autostart y
    ./dropbox.py start


