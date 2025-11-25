FROM python:3.10

# Install Node.js
RUN apt-get update && \
    apt-get install -y nodejs npm

# Install GCC for C++
RUN apt-get install -y g++

#install flask
RUN pip install flask

WORKDIR /app

COPY . .

RUN pip install -r requirements.txt

# Expose evaluator API port
EXPOSE 6000

CMD ["python3", "run.py"]
