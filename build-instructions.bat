@echo off
rem Remove all backup files.
del *~

rem Create the output file in the parent directory
set outfile=instructions\system-instructions.txt
del "%outfile%"
echo.>"%outfile%"

rem Loop through each file in the current directory
for %%a in (*) do (
  rem Add header with filename and type
  echo "/* %%a */" >> "%outfile%"

  rem Concatenate the file contents
  type "%%a" >> "%outfile%"

  rem Add separator after each file
  echo "===""===" >> "%outfile%"
)

echo Instructions concatenated into "%outfile%"