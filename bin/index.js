#!/usr/bin/env node

const {stdin, stdout } = require("process");
const readline = require('readline');
const { spawn } = require('child_process');
const textToSpeech = require('@google-cloud/text-to-speech');
const commandLineUsage = require('command-line-usage')
const commandLineArgs = require('command-line-args')

const optionList =  [
    { name: 'help', alias: 'h', type: Boolean, defaultValue: false },
    { name: 'play', alias: 'p', type: Boolean, defaultValue: false },
    { name: 'languageCode', alias: 'l', type: String, defaultValue: 'en-US'},
    { name: 'name', alias: 'n', type: String, defaultValue: 'en-US-Wavenet-H'},
    { name: 'ssmlGender', alias: 'g', type: String, defaultValue: 'FEMALE' },
    { name: 'encoding', alias: 'e', type: String, defaultValue: 'MP3'}
];

const sections = [
    {
        header: 'Google TTS Tool',
        content: 'Reads out text in stdin by line and writes to stdout. It also supports using Sox play command ' + 
            'instead of writing output to stdout. Due to limitations of Sox play command it waits until stdin is closed ' + 
            'before reading out, hence this option was added. \n' +
            'Setup example\n' +
            '$ export GOOGLE_APPLICATION_CREDENTIALS=./account_id.json',
    },
    {
        header: 'Options',
        optionList,
    }
]

const usage = commandLineUsage(sections)
  
const options = commandLineArgs(optionList)

if (options.help) {
    console.log(usage)
    process.exit(0);
}

function readParagraphs(readable) {
    return readline.createInterface(readable);
}

async function readAudioContent(promise) {
    const [response] = await promise;
    return response.audioContent;
}

async function * speak(paragraphs) {
    const client = new textToSpeech.TextToSpeechClient();

    for await (const text of paragraphs) {
        const request = {
            input: {text},
            voice: {languageCode: options.languageCode, name: options.name, ssmlGender: options.ssmlGender},
            audioConfig: {audioEncoding: 'MP3'},
        };

        yield readAudioContent(client.synthesizeSpeech(request));
    }
}

async function main() {

    stdin.setEncoding('utf8');
    const paragraphs = readParagraphs(stdin);

    const mp3files = speak(paragraphs);

    for await (const respPromise of mp3files) {
        try {
            const mp3Content = await respPromise;
            if (options.play) {
                const play = spawn('play', ['-t', 'mp3', '-']);
                play.stdin.write(mp3Content);
                play.stdin.end();
                // To make sure each audio file is played in sequence!
                await new Promise((resolve) => {
                    play.on('exit', resolve);
                });
            } else {
                stdout.write(mp3Content);
            }
        } catch (e) {
            console.warn(e);
        }
    }
}

main();
