var http = require('http');

describe("Hello World Server", function() {
    describe("GET /", function() {
        /*it("returns status code 200", function() {
            http.get(`http://localhost:3000/users?id='AT41',password='no'`, (res) => {
                res.on('data', (data) => {
                    expect(data).toBe(true);
                });
            });
        });*/
        it('returns true', function() {
            expect(false).toBe(true);
        })
    });
});