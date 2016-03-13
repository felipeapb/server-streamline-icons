# server-streamline-icons

Preview, pick and filter the Streamline Icons from http://www.streamlineicons.com/ to generate a zip-file with your own selection of the svg-icons.

![server-streamline-icons](https://raw.githubusercontent.com/reecube/server-streamline-icons/master/readme/screenshot1.png)

## Install

1. You need to get the Streamline Icons. I can't put them on the repository because they are licensed. You can get them on http://www.streamlineicons.com/
2. Clone this repository with `git clone <URL>`
3. Install the node-dependencies with `npm install`
4. Copy the source-files of your Streamline Icons to match the following structure (the application won't be working if the structure isn't correct!):
    - `<REPO>/data/<4.1:line|filled>/<4.2:SVG>/<4.3:SLI-GROUPS>/<4.4:ICON-FILES>`
    - 4.1. use 'line' or 'filled' depending on the icon-type
    - 4.2. use 'SVG' (if you want you can put other folders here, but they will be ignored)
    - 4.3. use the groups of the Streamline Icons, for example '01-content-edition'
    - 4.4. use your icon-files as svg-files, for example 'atomic-bomb.svg'
5. Build the project with `npm run build`
    - **Attention**: depending on the amount of your icons, this may take a while. I have a very fast computer and this task took 5-6 minutes to build the Ultimate-Pack with 4000 Icons (total of 8000 because of line- & filled-version). You won't be able to see some kind of progress, just wait and do not lose hope. ;-)

## Usage

Run the following command to start the server:

```
$ node .
```

For development use the following command (this command requires the nodemon-cli: `npm install -g nodemon`):

```
$ npm start
```

## API

Currently there is no API, sorry.

## License

MIT © [Yves Riedener](http://yves.reecube.com)
