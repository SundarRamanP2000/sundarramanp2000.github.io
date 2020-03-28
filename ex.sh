git add .
git commit -m 'fin'
#!/usr/bin/expect 
set name sundarramanp2000
set roll Sund@Priya1!
spawn git push
expect "Username for 'https://github.com': "
send -- "$name\r"
expect "Password for 'https://sundarramanp2000@github.com': "
send -- "$roll\r"
expect eof
 	

