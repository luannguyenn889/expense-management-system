@echo off
powershell -Command "(Get-Content '%1') -replace 'pick 6e37223', 'drop 6e37223' -replace 'pick 35239bd', 'drop 35239bd' -replace 'merge -C 35239bd', 'drop 35239bd' | Set-Content '%1'"
