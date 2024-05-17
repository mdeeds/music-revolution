#!/bin/bash

# Remove all backup files.
rm *~

# Create the output file in the parent directory
outfile="instructions/system-instructions.txt"
rm "$outfile"
touch "$outfile"

# Loop through each file in the current directory
for file in *; do

    # Add header with filename and type
    echo "/* $file */" >> "$outfile"

    # Concatenate the file contents
    cat "$file" >> "$outfile"

    # Add separator after each file
    echo "===""===" >> "$outfile"
done

echo "Instructions concatenated into $outfile"
