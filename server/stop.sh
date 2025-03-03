#!/bin/bash

PID=$(lsof -t -i :5000)

if [ -z "$PID" ]; then
  echo "No process is running on port 5000."
else
  echo "Stopping process with PID: $PID"
  kill $PID

  if [ $? -eq 0 ]; then
    echo "Process stopped successfully."
  else
    echo "Failed to stop the process."
  fi
fi