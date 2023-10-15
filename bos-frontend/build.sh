#!/bin/bash

# Ensure the build/src directory exists, or create it
mkdir -p build/src

# Loop over each .jsx file in the src directory
for src_file in src/*.jsx; do
  # Extract the filename without the path
  file_name=$(basename "$src_file")

  # Create or truncate the output file
  : > "build/src/$file_name"

  # Read the source file line by line
  while IFS= read -r line; do
		# Append the original line to the output file
		echo "$line" >> "build/src/$file_name"
    # Check if the line contains "//include "
    if [[ "$line" == "//include "* ]]; then
      # Extract the name of the file to be included
      include_name="${line#//include }"

      # Check if the file exists in the includes directory and concatenate its contents to the output file
      if [ -f "includes/$include_name.jsx" ]; then
        cat "includes/$include_name.jsx" >> "build/src/$file_name"
      else
        echo "Warning: includes/$include_name.jsx does not exist."
      fi
    fi


  done < "$src_file"
done

echo "Build complete. Files in build/src/ have been dynamically prepended based on '//include [name]' directives."

