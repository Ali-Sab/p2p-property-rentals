sudo fuser -n tcp -k 8000
sudo fuser -n tcp -k 3000

sudo apt update
sudo apt-get install python3 -y
sudo apt-get install python3-pip -y
sudo apt install python3-virtualenv -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm install node
node -v
npm -v

cd backend
virtualenv venv
source venv/bin/activate
pip install -r requirements.txt

mkdir static
mkdir media

python3 manage.py migrate

cd ../frontend/restify

npm install
