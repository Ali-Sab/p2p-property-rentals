sudo fuser -n tcp -k 8000
sudo fuser -n tcp -k 3000

trap 'kill $(jobs -p)' SIGINT EXIT

cd backend
source venv/bin/activate
python3 manage.py runserver &

cd ../frontend/restify
npm start
