const util = require("./util")
test("test minTime", () => {
    const testCases =
        [
            {
                times: [new Date("2020-08-12T14:18:10.482Z"), new Date("2020-08-11T14:15:02.532Z")],
                date: new Date("2020-08-11T14:15:02.532Z"),
            },
            {
                times: [new Date("2020-06-12T14:18:10.482Z"), new Date("2020-08-12T14:18:10.482Z"), new Date("2020-08-11T14:15:02.532Z")],
                date: new Date("2020-06-12T14:18:10.482Z"),
            },
        ]
    for (const testCase of testCases) {
        expect(util.minTime(testCase.times)).toEqual(testCase.date);
    }
})
