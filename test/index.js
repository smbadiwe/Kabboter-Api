// import request from 'supertest';
// import app from '../src/app';

// const mockListen = jest.fn();
// app.listen = mockListen;

// afterEach(() => {
//     mockListen.mockReset();
// });

// test('Server works', async () => {
//     console.log('running Server Works test');
//     require('../src/index');
//     expect(mockListen.mock.calls.length).to.equal(1);
//     expect(mockListen.mock.calls[0][0]).to.equal(process.env.PORT || 3000);
// });