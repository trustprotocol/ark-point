import {ApiPromise, WsProvider} from '@polkadot/api';
import { BlockHash } from '@polkadot/types/interfaces';
import { read } from 'fs';

const types = {
  Address: 'AccountId',
  AddressInfo: 'Vec<u8>',
  ETHAddress: 'Vec<u8>',
  FileAlias: 'Vec<u8>',
  Guarantee: {
    targets: 'Vec<IndividualExposure<AccountId, Balance>>',
    total: 'Compact<Balance>',
    submitted_in: 'EraIndex',
    suppressed: 'bool',
  },
  IASSig: 'Vec<u8>',
  Identity: {
    pub_key: 'Vec<u8>',
    code: 'Vec<u8>',
  },
  ISVBody: 'Vec<u8>',
  LookupSource: 'AccountId',
  MerchantInfo: {
    address: 'Vec<u8>',
    storage_price: 'Balance',
    file_map: 'Vec<(Vec<u8>, Vec<Hash>)>',
  },
  MerchantPunishment: {
    success: 'EraIndex',
    failed: 'EraIndex',
    value: 'Balance',
  },
  MerkleRoot: 'Vec<u8>',
  OrderStatus: {
    _enum: ['Success', 'Failed', 'Pending'],
  },
  PaymentLedger: {
    total: 'Balance',
    paid: 'Balance',
    unreserved: 'Balance',
  },
  Pledge: {
    total: 'Balance',
    used: 'Balance',
  },
  ReportSlot: 'u64',
  Releases: {
    _enum: ['V1_0_0', 'V2_0_0'],
  },
  SorderInfo: {
    file_identifier: 'MerkleRoot',
    file_size: 'u64',
    created_on: 'BlockNumber',
    merchant: 'AccountId',
    client: 'AccountId',
    amount: 'Balance',
    duration: 'BlockNumber',
  },
  SorderStatus: {
    completed_on: 'BlockNumber',
    expired_on: 'BlockNumber',
    status: 'OrderStatus',
    claimed_at: 'BlockNumber',
  },
  SorderPunishment: {
    success: 'BlockNumber',
    failed: 'BlockNumber',
    updated_at: 'BlockNumber',
  },
  Status: {
    _enum: ['Free', 'Reserved'],
  },
  StorageOrder: {
    file_identifier: 'Vec<u8>',
    file_size: 'u64',
    created_on: 'BlockNumber',
    completed_on: 'BlockNumber',
    expired_on: 'BlockNumber',
    provider: 'AccountId',
    client: 'AccountId',
    amount: 'Balance',
    order_status: 'OrderStatus',
  },
  SworkerCert: 'Vec<u8>',
  SworkerCode: 'Vec<u8>',
  SworkerPubKey: 'Vec<u8>',
  SworkerSignature: 'Vec<u8>',
  WorkReport: {
    report_slot: 'u64',
    used: 'u64',
    free: 'u64',
    files: 'BTreeMap<MerkleRoot, u64>',
    reported_files_size: 'u64',
    reported_srd_root: 'MerkleRoot',
    reported_files_root: 'MerkleRoot',
  },
};

export default class Chain {
  private readonly api: ApiPromise;

  constructor(addr: string) {
    this.api = this.newChainApi(addr);
  }

  async block(bh: BlockHash) {
    const readyApi = await this.api.isReady;
    const events = await readyApi.query.system.events.at(bh);
    return await readyApi.rpc.chain.getBlock(bh);
  }

  async blockHash(bn: number) {
    const readyApi = await this.api.isReady;
    return await readyApi.rpc.chain.getBlockHash(bn);
  }

  async events(bh: BlockHash) {
    const readyApi = await this.api.isReady;
    return await readyApi.query.system.events.at(bh);
  }

  async header() {
    const readyApi = await this.api.isReady;
    return await readyApi.rpc.chain.getHeader();
  }

  async stash(c: string) {
    const readyApi = await this.api.isReady;
    const ledger = (await readyApi.query.staking.ledger(c)).unwrap();
    return ledger.stash;
  }

  async blockAuthor(bh: BlockHash) {
    const readyApi = await this.api.isReady;
    const header = await readyApi.derive.chain.getHeader(bh);
    return header?.author?.toString();
  }

  private newChainApi(addr: string): ApiPromise {
    return new ApiPromise({
      provider: new WsProvider(addr),
      types,
    });
  }
}

