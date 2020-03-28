set name "sundarramanp2000"
set roll "Sund@Priya1!"
git add .
git commit -m 'fi'
spawn git push 
expect "Username for 'https://github.com': "
send "$name"
send "\n"

