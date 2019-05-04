const note = require('./note');

test('test parser args', () => {
    const argvStr = ["new", "./a/b/c", "--stt"]
    const expectJson = { "<PATH>": "./a/b/c", "--stt": true, new: true };
    expect(note.parseArgs(argvStr)).toEqual(expectJson)
});