const note = require('./note');
console.log("start");
// test('test parser args', () => {
//     const argvStr = ["new", "./a/b/c", "--stt"]
//     const expectJson = { "<PATH>": "./a/b/c", "--stt": true, new: true };
//     expect(note.parseArgs(argvStr)).toEqual(expectJson)
// });


function testAddIdInMd(input,expectOutput,mockId) {
    let res = note.addIdInMd(input,mockId);
    expect(res).toEqual(expectOutput);
}
test("test fix md",()=>{
//if has id do nothing
    testAddIdInMd(
`---
id: 2
---
# dkdksdkdsksd
dsksdkksddsksdk`,
`---
id: 2
---

# dkdksdkdsksd
dsksdkksddsksdk`,1);


// add it if not exist
testAddIdInMd(
`---
title: xxxx ddfdf
---    
# dkdksdkdsksd
dsksdkksddsksdk`,
`---
title: xxxx ddfdf
id: 1
---

# dkdksdkdsksd
dsksdkksddsksdk`,1);

console.log("test");

})