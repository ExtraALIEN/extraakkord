sudo unlink /etc/nginx/sites-enabled/extraakkord.conf
sudo ln -s /home/extraalien/projects/extraakkord/etc/extraakkord.conf /etc/nginx/sites-enabled
sudo service nginx stop
sudo service nginx start
gunicorn -c ./etc/gconf.py extraakkord.wsgi
