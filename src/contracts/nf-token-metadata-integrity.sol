// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@0xcert/ethereum-erc721/src/contracts/tokens/nf-token-metadata.sol";
import "./erc2477.sol";

/**
 * @dev This is an example contract implementation of NFToken with ERC2477 Metadata integrity.
 */
contract NFTokenMetadataIntegrity is
  NFTokenMetadata,
  ERC2477
{
  /**
   * @dev Hashing function.
   */
  string constant HASH_ALGORITHM = 'sha256';

  /**
   * @dev Unique ID which determines each ERC721 smart contract type by its JSON convention.
   * Calculated as keccak256(jsonSchema).
   */
  bytes32 internal schemaURIIntegrityDigest;

  /**
   * @dev Maps NFT ID to tokenURIIntegrityDigest.
   */
  mapping (uint256 => bytes32) internal idToIntegrityDigest;

  /**
   * @dev Contract constructor.
   * @param _name A descriptive name for a collection of NFTs.
   * @param _symbol An abbreviated name for NFTokens.
   * @param _schemaURIIntegrityDigest A bytes32 of keccak256 of json metadata schema. 
   */
  constructor(
    string memory _name,
    string memory _symbol,
    bytes32 _schemaURIIntegrityDigest
  ) {
    nftName = _name;
    nftSymbol = _symbol;
    schemaURIIntegrityDigest = _schemaURIIntegrityDigest;
    supportedInterfaces[0x832a7e0e] = true; // ERC2477
  }

  /**
   * @dev Mints a new NFT.
   * @param _to The address that will own the minted NFT.
   * @param _tokenId of the NFT to be minted by the msg.sender.
   * @param _uri String representing RFC 3986 URI.
   * @param _tokenURIIntegrityDigest Cryptographic asset uri integrity digest.
   */
  function mint(
    address _to,
    uint256 _tokenId,
    string calldata _uri,
    bytes32 _tokenURIIntegrityDigest
  )
    external
  {
    super._mint(_to, _tokenId);
    super._setTokenUri(_tokenId, _uri);
    idToIntegrityDigest[_tokenId] = _tokenURIIntegrityDigest;
  }

  /**
   * @notice Get the cryptographic hash of the specified tokenID's metadata
   * @param _tokenId Identifier for a specific token
   * @return digest Bytes returned from the hash algorithm
   * @return hashAlgorithm The name of the cryptographic hash algorithm
   */
  function tokenURIIntegrity(uint256 _tokenId)
    override
    external
    view
    returns(bytes memory digest, string memory hashAlgorithm)
  {
    require(idToOwner[_tokenId] != address(0), NOT_VALID_NFT);
    digest = abi.encodePacked(idToIntegrityDigest[_tokenId]);
    hashAlgorithm = HASH_ALGORITHM;
  }

  /**
   * @notice Get the cryptographic hash for the specified tokenID's metadata schema
   * @param _tokenId Identifier for a specific token
   * @return digest Bytes returned from the hash algorithm or "" if there is no schema
   * @return hashAlgorithm The name of the cryptographic hash algorithm or "" if there is no schema
   */
  function tokenURISchemaIntegrity(uint256 _tokenId)
    override
    external
    view
    returns(bytes memory digest, string memory hashAlgorithm)
  {
    require(idToOwner[_tokenId] != address(0), NOT_VALID_NFT);
    digest = abi.encodePacked(schemaURIIntegrityDigest);
    hashAlgorithm = HASH_ALGORITHM;
  }

}
