# Iaso documentation

## In order to generate the documentations automatically

- Be in the project root directory
- Have all the requirements installed
- cd into `/docs`
- run `sphinx-apidoc -o sources/generated/iaso ../iaso`
- run `sphinx-apidoc -o sources/generated/hat ../hat`
- run `make clean && make html