# OkiPoki

You need to first get your Google Cloud credentials to use this. It reads out the
text files piped into it. It internally will readout using SoX play command, if it
is not installed that will be your next step. If not you can get the output as mp3
and play them in your own browser. 

It internally splits using newlines, so as long as every paragraph is less than 
Google's permitted size it will work fine. 


```
$ npm install -g okipoki
$ export GOOGLE_APPLICATION_CREDENTIALS=./account_id.json
$ echo "Hello!" | okipoki -p
```

See --help for additional options, without -p, mp3 content is written to the stdout. 

