const { expect } = require('chai');

describe('nf-token-metadata-integrity', function() {
  let nfToken, owner, bob;
  const schemaDigest = '0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658';
  const id1 = 1;
  const uri1 = 'http://example.foo/1';
  const digest1 = '0x973124ffc4a03e66d6a4458e587d5d6146f71fc57f359c8d516e0b12a50ab0d9';

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