/// <reference types="mocha" />
import { noCallThru } from 'proxyquire';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

const proxyquire = noCallThru();
const expect = chai.expect;
chai.use(sinonChai);

describe('Packbin Adapter', () => {
  let express,
      expressMock,
      Adapter;

  beforeEach(() => {
    express = {
      Router: () => {}
    };
    expressMock = sinon.mock(express);

    proxyquire('../src/index', {
      'express': express
    });
    Adapter = require('../src/index').PackbinAdapter;
  });

  afterEach(() => {
    expressMock.verify();
    delete require.cache[require.resolve('../src/index')];
  });

  it('should construct an adapter', () => {
    const filter = {};

    expressMock.expects('Router')
      .once()
      .withExactArgs()
      .returns('a router');

    const adapter = new Adapter('test', filter);

    expect(adapter.requestFilter).to.equal(filter);
    expect(adapter.router).to.equal('a router');
  });

  describe('authentication and authorization', () => {
    let adapter;

    beforeEach(() => {
      expressMock.expects('Router')
        .once()
        .withExactArgs()
        .returns('a router');

      adapter = new Adapter('test', {});
    });

    it('should call the Packbin authenticate function', () => {
      const authCb = sinon.spy(() => 'promise');

      adapter._packbin = {
          authenticate: authCb
      };

      const result = adapter.authenticate('foo', 'bar');
      expect(authCb).to.have.been.calledOnce;
      expect(authCb).to.have.been.calledWith('foo', 'bar');
      expect(result).to.equal('promise');
    });

    it('should call the Packbin authenticateWithToken function', () => {
        const authCb = sinon.spy(() => 'promise');

        adapter._packbin = {
            authenticateWithToken: authCb
        };

        const result = adapter.authenticateWithToken('some-token');
        expect(authCb).to.have.been.calledOnce;
        expect(authCb).to.have.been.calledWith('test', 'some-token');
        expect(result).to.equal('promise');
    });

    it('should call the Packbin authorize function', () => {
      const authCb = sinon.spy(() => 'promise');

      adapter._packbin = {
          authorize: authCb
      };

      const result = adapter.authorize({username: 'foo'}, 'list', 'foo', 'bar', 'baz');
      expect(authCb).to.have.been.calledOnce;
      expect(authCb).to.have.been.calledWith({username: 'foo'}, 'test', 'list', 'foo', 'bar', 'baz');
      expect(result).to.equal('promise');
    });

    it('should call the Packbin generateAuthToken function', () => {
        const authCb = sinon.spy(() => 'promise');

        adapter._packbin = {
            generateAuthToken: authCb
        };

        const result = adapter.getTokenForUser('foo', 'bar');
        expect(authCb).to.have.been.calledOnce;
        expect(authCb).to.have.been.calledWith('test', 'foo', 'bar');
        expect(result).to.equal('promise');
    });
  })
});

