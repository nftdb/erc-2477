const { expect } = require('chai');
const { utils } = require('ethers');
const schema = require('../meta/schema.json');
const metadata = require('../meta/metadata.json');

describe('nf-token-metadata-integrity', function() {
  let nfToken, owner, bob, schemaDigest, digest1;
  const id1 = 1;
  const uri1 = 'http://example.foo/1';

  before(async () => {
    schemaDigest = utils.sha256(utils.toUtf8Bytes(JSON.stringify(schema)));
    digest1 = utils.sha256(utils.toUtf8Bytes(JSON.stringify(metadata)));
  });

  beforeEach(async () => {
    const nftContract = await ethers.getContractFactory('NFTokenMetadataIntegrity');
    nfToken = await nftContract.deploy(
      'Foo',
      'F',
      schemaDigest
    );
    [ owner, bob ] = await ethers.getSigners();
    await nfToken.deployed();
  });

  it('correctly checks supported interface', async function() {
    expect(await nfToken.supportsInterface('0x832a7e0e')).to.equal(true);
  });

  it('correctly checks token metadata schema integrity', async function() {
    await nfToken.connect(owner).mint(bob.address, id1, uri1, digest1);
    const { digest, hashAlgorithm } = await nfToken.tokenURISchemaIntegrity(id1);
    expect(digest).to.equal(schemaDigest);
    expect(hashAlgorithm).to.equal('sha256');
  });

  it('correctly checks token metadata integrity', async function() {
    await nfToken.connect(owner).mint(bob.address, id1, uri1, digest1);
    const { digest, hashAlgorithm } = await nfToken.tokenURIIntegrity(id1);
    expect(digest).to.equal(digest1);
    expect(hashAlgorithm).to.equal('sha256');
  });

  it('throws when trying to find token metadata schema integrity of non-existing NFT id', async function() {
    await expect(nfToken.tokenURISchemaIntegrity(id1)).to.be.revertedWith('003002');
  });

  it('throws when trying to find token metadata integrity of non-existing NFT id', async function() {
    await expect(nfToken.tokenURIIntegrity(id1)).to.be.revertedWith('003002');
  });

});