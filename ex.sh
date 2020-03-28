#! /usr/bin/expect

set name "sundarramanp2000"
set roll "Sund@Priya1!"
spawn git add .
spawn git commit -m 'fi'
spawn git push 
expect "Username for 'https://github.com': "
send "$name"
send "\n"

