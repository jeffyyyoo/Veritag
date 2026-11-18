import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}





export interface Unit {
  activated_at: u64;
  batch_id: Buffer;
  brand: string;
  claims_used: u32;
  duplicate_attempts: u32;
  history_len: u32;
  last_transferred_at: u64;
  owner: string;
  status: UnitStatus;
  transfer_count: u32;
  warranty_expiry: u64;
}


export interface Batch {
  brand: string;
  created_at: u64;
  expires_at: Option<u64>;
  frozen: boolean;
  /**
 * None allows transfers without a batch cap; Some(0) disables transfers.
 */
max_transfers: Option<u32>;
  merkle_root: Buffer;
  metadata_cid: Option<Buffer>;
  product_meta_hash: Buffer;
  recalled: boolean;
  status: BatchStatus;
  unit_count: u64;
  warranty_months: u32;
}


export interface Brand {
  admin: string;
  admin_config: BrandAdminConfig;
  admin_generation: u32;
  domain: string;
  next_action_id: u32;
  registered_at: u64;
  verified: boolean;
}


export interface Claim {
  filed_at: u64;
  id: u32;
  outcome: ClaimOutcome;
  report_hash: Buffer;
  resolved_at: u64;
  service_center: string;
}


export interface Config {
  admin: string;
  max_claims_per_unit: u32;
}


export interface UnitView {
  activated_at: u64;
  batch_id: Buffer;
  batch_recalled: boolean;
  brand: string;
  claims_used: u32;
  duplicate_attempts: u32;
  history_len: u32;
  owner: string;
  status: UnitStatus;
  transfer_count: u32;
  unit_id: Buffer;
  warranty_expiry: u64;
  warranty_valid: boolean;
}


export interface RecallInfo {
  notice_hash: Buffer;
  recalled_at: u64;
  /**
 * 1: critical/life safety; 2: functional defect; 3: cosmetic/labeling.
 * Soroban represents small unsigned integers as u32 in its contract ABI.
 */
severity: u32;
}

export enum UnitStatus {
  Active = 0,
  Flagged = 1,
  Recalled = 2,
  Retired = 3,
}

export type BatchStatus = {tag: "Active", values: void} | {tag: "Expired", values: void} | {tag: "Recalled", values: void};

export type BrandAction = {tag: "FreezeBatch", values: readonly [Buffer]} | {tag: "UnfreezeBatch", values: readonly [Buffer]} | {tag: "RecallBatch", values: readonly [Buffer, u32, Buffer]} | {tag: "RegisterServiceCenter", values: readonly [string]} | {tag: "RevokeServiceCenter", values: readonly [string]} | {tag: "UpdateServiceCenterTier", values: readonly [string, u32]} | {tag: "ConfigureAdmins", values: readonly [BrandAdminConfig]};

export enum ClaimOutcome {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Repaired = 3,
  Replaced = 4,
}


export interface VerifyResult {
  activated: boolean;
  activated_at: u64;
  batch_recalled: boolean;
  brand_verified: boolean;
  claims_used: u32;
  duplicate_attempts: u32;
  owner: Option<string>;
  proof_valid: boolean;
  status: VerifyStatus;
  unit_id: Buffer;
  warranty_expiry: u64;
  warranty_valid: boolean;
}

export enum VerifyStatus {
  Unknown = 0,
  AuthenticInactive = 1,
  AuthenticActive = 2,
  Flagged = 3,
  Recalled = 4,
  Retired = 5,
}

export const RegistryError = {
  1: {message:"AlreadyInitialized"},
  2: {message:"NotInitialized"},
  3: {message:"NotAuthorized"},
  4: {message:"BrandAlreadyExists"},
  5: {message:"BrandNotFound"},
  6: {message:"BrandNotVerified"},
  7: {message:"BatchExists"},
  8: {message:"BatchNotFound"},
  9: {message:"InvalidProof"},
  10: {message:"UnitAlreadyActivated"},
  11: {message:"UnitNotFound"},
  12: {message:"WarrantyExpired"},
  13: {message:"ClaimLimitReached"},
  14: {message:"TransferOfferNotFound"},
  15: {message:"TransferOfferExpired"},
  16: {message:"InvalidTransferCode"},
  17: {message:"UnitFlagged"},
  18: {message:"BatchRecalled"},
  19: {message:"ServiceCenterNotAuthorized"},
  20: {message:"ClaimNotFound"},
  21: {message:"ClaimAlreadyResolved"},
  22: {message:"InvalidInput"},
  23: {message:"UnitRetired"},
  24: {message:"BatchExpired"},
  25: {message:"BatchFrozen"},
  26: {message:"TransferCooldownActive"},
  27: {message:"TransferLimitReached"},
  28: {message:"WarrantyLimitReached"}
}


export interface ServiceCenter {
  active: boolean;
  /**
 * 1: inspection; 2: repair; 3: full replacement.
 */
tier: u32;
}


export interface TransferOffer {
  code_hash: Buffer;
  created_at: u64;
  expires_at: u64;
}


export interface UnitRetirement {
  caller: string;
  cert_hash: Buffer;
  reason_code: u32;
  retired_at: u64;
}


export interface BrandAdminConfig {
  admins: Array<string>;
  threshold: u32;
}


export interface BrandActionProposal {
  action: BrandAction;
  admin_generation: u32;
  approvals: Array<string>;
  caller: string;
  executed: boolean;
}























export type DataKey = {tag: "Config", values: void} | {tag: "Brand", values: readonly [string]} | {tag: "BrandAction", values: readonly [string, u32]} | {tag: "ServiceCenter", values: readonly [string, string]} | {tag: "Batch", values: readonly [string, Buffer]} | {tag: "BatchRecallInfo", values: readonly [string, Buffer]} | {tag: "Unit", values: readonly [Buffer]} | {tag: "UnitRetirement", values: readonly [Buffer]} | {tag: "Offer", values: readonly [Buffer]} | {tag: "Claim", values: readonly [Buffer, u32]};


/**
 * Storage layout used before optional expiration was introduced.
 */
export interface LegacyBatch {
  brand: string;
  created_at: u64;
  merkle_root: Buffer;
  product_meta_hash: Buffer;
  recalled: boolean;
  unit_count: u64;
  warranty_months: u32;
}


/**
 * Storage layout used before threshold governance was introduced.
 */
export interface LegacyBrand {
  admin: string;
  domain: string;
  registered_at: u64;
  verified: boolean;
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initializes the global registry configuration with an admin account.
   */
  init: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a activate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Lazily activates a unit on first sale or claim by verifying its Merkle proof and secret.
   */
  activate: ({brand, batch_id, serial_hash, proof, secret, first_owner}: {brand: string, batch_id: Buffer, serial_hash: Buffer, proof: Array<Buffer>, secret: Buffer, first_owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<Buffer>>>

  /**
   * Construct and simulate a get_unit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_unit: ({unit_id}: {unit_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<UnitView>>>

  /**
   * Construct and simulate a flag_unit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Flags an individual unit as compromised, stolen, or counterfeit (brand admin only).
   */
  flag_unit: ({unit_id, reason_hash}: {unit_id: Buffer, reason_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_batch: ({brand, batch_id}: {brand: string, batch_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Batch>>>

  /**
   * Construct and simulate a get_brand transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_brand: ({brand}: {brand: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Brand>>>

  /**
   * Construct and simulate a get_claim transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_claim: ({unit_id, claim_id}: {unit_id: Buffer, claim_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Claim>>>

  /**
   * Construct and simulate a file_claim transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Files a warranty claim with an authorized service center for the unit's brand.
   */
  file_claim: ({unit_id, service_center}: {unit_id: Buffer, service_center: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_config: (options?: MethodOptions) => Promise<AssembledTransaction<Option<Config>>>

  /**
   * Construct and simulate a retire_unit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Permanently retires a unit and records its recycling certificate (owner or brand admin).
   */
  retire_unit: ({caller, unit_id, reason_code, cert_hash}: {caller: string, unit_id: Buffer, reason_code: u32, cert_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a commit_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Commits a production batch Merkle root for a verified brand.
   */
  commit_batch: ({brand, batch_id, merkle_root, warranty_months, product_meta_hash, unit_count, expires_at, metadata_cid}: {brand: string, batch_id: Buffer, merkle_root: Buffer, warranty_months: u32, product_meta_hash: Buffer, unit_count: u64, expires_at: Option<u64>, metadata_cid: Option<Buffer>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a freeze_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Temporarily suspends activations and new warranty claims (brand admin only).
   */
  freeze_batch: ({brand, batch_id}: {brand: string, batch_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a recall_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Recalls a batch with a severity tier (1..=3) and regulatory notice digest (brand admin only).
   */
  recall_batch: ({brand, batch_id, severity, notice_hash}: {brand: string, batch_id: Buffer, severity: u32, notice_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a rotate_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Rotates the registry admin account (registry admin + new admin auth).
   */
  rotate_admin: ({new_admin}: {new_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a verify_brand transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Marks a registered brand as verified after off-chain `stellar.toml` domain validation.
   */
  verify_brand: ({brand}: {brand: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a bump_unit_ttl transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Extends TTL for a persistent unit record (callable by maintenance workers).
   */
  bump_unit_ttl: ({unit_id}: {unit_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a resolve_claim transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Resolves a pending warranty claim (authorized service center only).
   */
  resolve_claim: ({unit_id, claim_id, outcome, report_hash}: {unit_id: Buffer, claim_id: u32, outcome: ClaimOutcome, report_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a verify_serial transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Public verification helper combining batch lookup, Merkle proof validation, and unit state.
   */
  verify_serial: ({brand, batch_id, serial_hash, proof, secret_hash}: {brand: string, batch_id: Buffer, serial_hash: Buffer, proof: Array<Buffer>, secret_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<VerifyResult>>

  /**
   * Construct and simulate a bump_batch_ttl transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Extends TTL for a persistent batch record (callable by maintenance workers).
   */
  bump_batch_ttl: ({brand, batch_id}: {brand: string, batch_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a register_brand transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Registers a brand with its domain name (`stellar.toml` verification pending).
   */
  register_brand: ({brand, domain}: {brand: string, domain: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a unfreeze_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Clears a temporary suspension without reversing a permanent recall (brand admin only).
   */
  unfreeze_batch: ({brand, batch_id}: {brand: string, batch_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a compute_unit_id transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  compute_unit_id: ({brand, batch_id, serial_hash}: {brand: string, batch_id: Buffer, serial_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Buffer>>

  /**
   * Construct and simulate a extend_warranty transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Adds months to the existing expiry, including for a lapsed warranty (brand admin only).
   * Total coverage cannot exceed 120 months from activation.
   */
  extend_warranty: ({brand, unit_id, additional_months}: {brand: string, unit_id: Buffer, additional_months: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u64>>>

  /**
   * Construct and simulate a redeem_transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Redeems a one-time transfer code to transfer ownership and remaining warranty to `new_owner`.
   */
  redeem_transfer: ({unit_id, code, new_owner}: {unit_id: Buffer, code: Buffer, new_owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_brand_action transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_brand_action: ({brand, proposal_id}: {brand: string, proposal_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Option<BrandActionProposal>>>

  /**
   * Construct and simulate a is_service_center transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_service_center: ({brand, service_center}: {brand: string, service_center: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a is_warranty_valid transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_warranty_valid: ({unit_id}: {unit_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a set_max_transfers transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Sets a batch's custody transfer cap (brand admin only).
   * None removes the cap; Some(0) disables transfers without resetting unit counters.
   */
  set_max_transfers: ({brand, batch_id, max_transfers}: {brand: string, batch_id: Buffer, max_transfers: Option<u32>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_service_center transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_service_center: ({brand, service_center}: {brand: string, service_center: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<ServiceCenter>>>

  /**
   * Construct and simulate a get_transfer_offer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_transfer_offer: ({unit_id}: {unit_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<TransferOffer>>>

  /**
   * Construct and simulate a rotate_brand_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Rotates the signing admin key for an existing brand while keeping its canonical brand address.
   */
  rotate_brand_admin: ({brand, new_admin}: {brand: string, new_admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_unit_retirement transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_unit_retirement: ({unit_id}: {unit_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<UnitRetirement>>>

  /**
   * Construct and simulate a approve_brand_action transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Adds one authenticated admin approval and executes only when the threshold is met.
   */
  approve_brand_action: ({caller, brand, proposal_id}: {caller: string, brand: string, proposal_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a propose_brand_action transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Proposes a sensitive action and records the authenticated proposer's first approval.
   */
  propose_brand_action: ({caller, brand, action}: {caller: string, brand: string, action: BrandAction}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a cancel_transfer_offer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancels an active resale transfer offer (current owner only).
   */
  cancel_transfer_offer: ({unit_id}: {unit_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a create_transfer_offer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Creates a one-time resale transfer offer authenticated by the current owner.
   */
  create_transfer_offer: ({unit_id, code_hash, expires_at}: {unit_id: Buffer, code_hash: Buffer, expires_at: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_batch_recall_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_batch_recall_info: ({brand, batch_id}: {brand: string, batch_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<RecallInfo>>>

  /**
   * Construct and simulate a revoke_service_center transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Revokes a service center's authorization for a brand.
   */
  revoke_service_center: ({brand, service_center}: {brand: string, service_center: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a configure_brand_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Configures initial threshold governance; later changes require an approved action.
   */
  configure_brand_admins: ({brand, config}: {brand: string, config: BrandAdminConfig}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_batch_metadata_cid transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns the immutable optional document digest for a committed batch.
   */
  get_batch_metadata_cid: ({brand, batch_id}: {brand: string, batch_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Buffer>>>

  /**
   * Construct and simulate a get_brand_admin_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_brand_admin_config: ({brand}: {brand: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<BrandAdminConfig>>>

  /**
   * Construct and simulate a register_service_center transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Authorizes a service center, defaulting new centers to tier 3 for compatibility.
   * Reauthorization preserves its existing tier.
   */
  register_service_center: ({brand, service_center}: {brand: string, service_center: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_max_claims_per_unit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Updates the global per-unit warranty claim limit (registry admin only).
   */
  set_max_claims_per_unit: ({max_claims}: {max_claims: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a report_duplicate_attempt transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Persists a verified duplicate activation attempt on-chain when an already-claimed unit's
   * physical package secret is submitted again, incrementing `duplicate_attempts` and emitting
   * `duplicate_attempt` without rolling back transaction state.
   */
  report_duplicate_attempt: ({caller, brand, batch_id, serial_hash, proof, secret}: {caller: string, brand: string, batch_id: Buffer, serial_hash: Buffer, proof: Array<Buffer>, secret: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a update_service_center_tier transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Updates accreditation without reactivating a revoked center (brand admin only).
   */
  update_service_center_tier: ({brand, service_center, new_tier}: {brand: string, service_center: string, new_tier: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAERJbml0aWFsaXplcyB0aGUgZ2xvYmFsIHJlZ2lzdHJ5IGNvbmZpZ3VyYXRpb24gd2l0aCBhbiBhZG1pbiBhY2NvdW50LgAAAARpbml0AAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAFhMYXppbHkgYWN0aXZhdGVzIGEgdW5pdCBvbiBmaXJzdCBzYWxlIG9yIGNsYWltIGJ5IHZlcmlmeWluZyBpdHMgTWVya2xlIHByb29mIGFuZCBzZWNyZXQuAAAACGFjdGl2YXRlAAAABgAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAAAAAAtzZXJpYWxfaGFzaAAAAAPuAAAAIAAAAAAAAAAFcHJvb2YAAAAAAAPqAAAD7gAAACAAAAAAAAAABnNlY3JldAAAAAAADgAAAAAAAAALZmlyc3Rfb3duZXIAAAAAEwAAAAEAAAPpAAAD7gAAACAAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAIZ2V0X3VuaXQAAAABAAAAAAAAAAd1bml0X2lkAAAAA+4AAAAgAAAAAQAAA+gAAAfQAAAACFVuaXRWaWV3",
        "AAAAAAAAAFNGbGFncyBhbiBpbmRpdmlkdWFsIHVuaXQgYXMgY29tcHJvbWlzZWQsIHN0b2xlbiwgb3IgY291bnRlcmZlaXQgKGJyYW5kIGFkbWluIG9ubHkpLgAAAAAJZmxhZ191bml0AAAAAAAAAgAAAAAAAAAHdW5pdF9pZAAAAAPuAAAAIAAAAAAAAAALcmVhc29uX2hhc2gAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAJZ2V0X2JhdGNoAAAAAAAAAgAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAQAAA+gAAAfQAAAABUJhdGNoAAAA",
        "AAAAAAAAAAAAAAAJZ2V0X2JyYW5kAAAAAAAAAQAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAQAAA+gAAAfQAAAABUJyYW5kAAAA",
        "AAAAAAAAAAAAAAAJZ2V0X2NsYWltAAAAAAAAAgAAAAAAAAAHdW5pdF9pZAAAAAPuAAAAIAAAAAAAAAAIY2xhaW1faWQAAAAEAAAAAQAAA+gAAAfQAAAABUNsYWltAAAA",
        "AAAAAAAAAE5GaWxlcyBhIHdhcnJhbnR5IGNsYWltIHdpdGggYW4gYXV0aG9yaXplZCBzZXJ2aWNlIGNlbnRlciBmb3IgdGhlIHVuaXQncyBicmFuZC4AAAAAAApmaWxlX2NsYWltAAAAAAACAAAAAAAAAAd1bml0X2lkAAAAA+4AAAAgAAAAAAAAAA5zZXJ2aWNlX2NlbnRlcgAAAAAAEwAAAAEAAAPpAAAABAAAB9AAAAANUmVnaXN0cnlFcnJvcgAAAA==",
        "AAAAAAAAAAAAAAAKZ2V0X2NvbmZpZwAAAAAAAAAAAAEAAAPoAAAH0AAAAAZDb25maWcAAA==",
        "AAAAAAAAAFhQZXJtYW5lbnRseSByZXRpcmVzIGEgdW5pdCBhbmQgcmVjb3JkcyBpdHMgcmVjeWNsaW5nIGNlcnRpZmljYXRlIChvd25lciBvciBicmFuZCBhZG1pbikuAAAAC3JldGlyZV91bml0AAAAAAQAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAHdW5pdF9pZAAAAAPuAAAAIAAAAAAAAAALcmVhc29uX2NvZGUAAAAABAAAAAAAAAAJY2VydF9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAADxDb21taXRzIGEgcHJvZHVjdGlvbiBiYXRjaCBNZXJrbGUgcm9vdCBmb3IgYSB2ZXJpZmllZCBicmFuZC4AAAAMY29tbWl0X2JhdGNoAAAACAAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAAAAAAttZXJrbGVfcm9vdAAAAAPuAAAAIAAAAAAAAAAPd2FycmFudHlfbW9udGhzAAAAAAQAAAAAAAAAEXByb2R1Y3RfbWV0YV9oYXNoAAAAAAAD7gAAACAAAAAAAAAACnVuaXRfY291bnQAAAAAAAYAAAAAAAAACmV4cGlyZXNfYXQAAAAAA+gAAAAGAAAAAAAAAAxtZXRhZGF0YV9jaWQAAAPoAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAExUZW1wb3JhcmlseSBzdXNwZW5kcyBhY3RpdmF0aW9ucyBhbmQgbmV3IHdhcnJhbnR5IGNsYWltcyAoYnJhbmQgYWRtaW4gb25seSkuAAAADGZyZWV6ZV9iYXRjaAAAAAIAAAAAAAAABWJyYW5kAAAAAAAAEwAAAAAAAAAIYmF0Y2hfaWQAAAPuAAAAIAAAAAEAAAPpAAAAAgAAB9AAAAANUmVnaXN0cnlFcnJvcgAAAA==",
        "AAAAAAAAAF1SZWNhbGxzIGEgYmF0Y2ggd2l0aCBhIHNldmVyaXR5IHRpZXIgKDEuLj0zKSBhbmQgcmVndWxhdG9yeSBub3RpY2UgZGlnZXN0IChicmFuZCBhZG1pbiBvbmx5KS4AAAAAAAAMcmVjYWxsX2JhdGNoAAAABAAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAAAAAAhzZXZlcml0eQAAAAQAAAAAAAAAC25vdGljZV9oYXNoAAAAA+4AAAAgAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAEVSb3RhdGVzIHRoZSByZWdpc3RyeSBhZG1pbiBhY2NvdW50IChyZWdpc3RyeSBhZG1pbiArIG5ldyBhZG1pbiBhdXRoKS4AAAAAAAAMcm90YXRlX2FkbWluAAAAAQAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAANUmVnaXN0cnlFcnJvcgAAAA==",
        "AAAAAAAAAFZNYXJrcyBhIHJlZ2lzdGVyZWQgYnJhbmQgYXMgdmVyaWZpZWQgYWZ0ZXIgb2ZmLWNoYWluIGBzdGVsbGFyLnRvbWxgIGRvbWFpbiB2YWxpZGF0aW9uLgAAAAAADHZlcmlmeV9icmFuZAAAAAEAAAAAAAAABWJyYW5kAAAAAAAAEwAAAAEAAAPpAAAAAgAAB9AAAAANUmVnaXN0cnlFcnJvcgAAAA==",
        "AAAAAAAAAEtFeHRlbmRzIFRUTCBmb3IgYSBwZXJzaXN0ZW50IHVuaXQgcmVjb3JkIChjYWxsYWJsZSBieSBtYWludGVuYW5jZSB3b3JrZXJzKS4AAAAADWJ1bXBfdW5pdF90dGwAAAAAAAABAAAAAAAAAAd1bml0X2lkAAAAA+4AAAAgAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAENSZXNvbHZlcyBhIHBlbmRpbmcgd2FycmFudHkgY2xhaW0gKGF1dGhvcml6ZWQgc2VydmljZSBjZW50ZXIgb25seSkuAAAAAA1yZXNvbHZlX2NsYWltAAAAAAAABAAAAAAAAAAHdW5pdF9pZAAAAAPuAAAAIAAAAAAAAAAIY2xhaW1faWQAAAAEAAAAAAAAAAdvdXRjb21lAAAAB9AAAAAMQ2xhaW1PdXRjb21lAAAAAAAAAAtyZXBvcnRfaGFzaAAAAAPuAAAAIAAAAAEAAAPpAAAAAgAAB9AAAAANUmVnaXN0cnlFcnJvcgAAAA==",
        "AAAAAAAAAFtQdWJsaWMgdmVyaWZpY2F0aW9uIGhlbHBlciBjb21iaW5pbmcgYmF0Y2ggbG9va3VwLCBNZXJrbGUgcHJvb2YgdmFsaWRhdGlvbiwgYW5kIHVuaXQgc3RhdGUuAAAAAA12ZXJpZnlfc2VyaWFsAAAAAAAABQAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAAAAAAtzZXJpYWxfaGFzaAAAAAPuAAAAIAAAAAAAAAAFcHJvb2YAAAAAAAPqAAAD7gAAACAAAAAAAAAAC3NlY3JldF9oYXNoAAAAA+4AAAAgAAAAAQAAB9AAAAAMVmVyaWZ5UmVzdWx0",
        "AAAAAAAAAExFeHRlbmRzIFRUTCBmb3IgYSBwZXJzaXN0ZW50IGJhdGNoIHJlY29yZCAoY2FsbGFibGUgYnkgbWFpbnRlbmFuY2Ugd29ya2VycykuAAAADmJ1bXBfYmF0Y2hfdHRsAAAAAAACAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAACGJhdGNoX2lkAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAE1SZWdpc3RlcnMgYSBicmFuZCB3aXRoIGl0cyBkb21haW4gbmFtZSAoYHN0ZWxsYXIudG9tbGAgdmVyaWZpY2F0aW9uIHBlbmRpbmcpLgAAAAAAAA5yZWdpc3Rlcl9icmFuZAAAAAAAAgAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAAZkb21haW4AAAAAABAAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAFZDbGVhcnMgYSB0ZW1wb3Jhcnkgc3VzcGVuc2lvbiB3aXRob3V0IHJldmVyc2luZyBhIHBlcm1hbmVudCByZWNhbGwgKGJyYW5kIGFkbWluIG9ubHkpLgAAAAAADnVuZnJlZXplX2JhdGNoAAAAAAACAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAACGJhdGNoX2lkAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAAPY29tcHV0ZV91bml0X2lkAAAAAAMAAAAAAAAABWJyYW5kAAAAAAAAEwAAAAAAAAAIYmF0Y2hfaWQAAAPuAAAAIAAAAAAAAAALc2VyaWFsX2hhc2gAAAAD7gAAACAAAAABAAAD7gAAACA=",
        "AAAAAAAAAJBBZGRzIG1vbnRocyB0byB0aGUgZXhpc3RpbmcgZXhwaXJ5LCBpbmNsdWRpbmcgZm9yIGEgbGFwc2VkIHdhcnJhbnR5IChicmFuZCBhZG1pbiBvbmx5KS4KVG90YWwgY292ZXJhZ2UgY2Fubm90IGV4Y2VlZCAxMjAgbW9udGhzIGZyb20gYWN0aXZhdGlvbi4AAAAPZXh0ZW5kX3dhcnJhbnR5AAAAAAMAAAAAAAAABWJyYW5kAAAAAAAAEwAAAAAAAAAHdW5pdF9pZAAAAAPuAAAAIAAAAAAAAAARYWRkaXRpb25hbF9tb250aHMAAAAAAAAEAAAAAQAAA+kAAAAGAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAF1SZWRlZW1zIGEgb25lLXRpbWUgdHJhbnNmZXIgY29kZSB0byB0cmFuc2ZlciBvd25lcnNoaXAgYW5kIHJlbWFpbmluZyB3YXJyYW50eSB0byBgbmV3X293bmVyYC4AAAAAAAAPcmVkZWVtX3RyYW5zZmVyAAAAAAMAAAAAAAAAB3VuaXRfaWQAAAAD7gAAACAAAAAAAAAABGNvZGUAAAAOAAAAAAAAAAluZXdfb3duZXIAAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAAAAAAAQZ2V0X2JyYW5kX2FjdGlvbgAAAAIAAAAAAAAABWJyYW5kAAAAAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAEAAAPoAAAH0AAAABNCcmFuZEFjdGlvblByb3Bvc2FsAA==",
        "AAAAAAAAAAAAAAARaXNfc2VydmljZV9jZW50ZXIAAAAAAAACAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAADnNlcnZpY2VfY2VudGVyAAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAARaXNfd2FycmFudHlfdmFsaWQAAAAAAAABAAAAAAAAAAd1bml0X2lkAAAAA+4AAAAgAAAAAQAAAAE=",
        "AAAAAAAAAIlTZXRzIGEgYmF0Y2gncyBjdXN0b2R5IHRyYW5zZmVyIGNhcCAoYnJhbmQgYWRtaW4gb25seSkuCk5vbmUgcmVtb3ZlcyB0aGUgY2FwOyBTb21lKDApIGRpc2FibGVzIHRyYW5zZmVycyB3aXRob3V0IHJlc2V0dGluZyB1bml0IGNvdW50ZXJzLgAAAAAAABFzZXRfbWF4X3RyYW5zZmVycwAAAAAAAAMAAAAAAAAABWJyYW5kAAAAAAAAEwAAAAAAAAAIYmF0Y2hfaWQAAAPuAAAAIAAAAAAAAAANbWF4X3RyYW5zZmVycwAAAAAAA+gAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAAAAAAASZ2V0X3NlcnZpY2VfY2VudGVyAAAAAAACAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAADnNlcnZpY2VfY2VudGVyAAAAAAATAAAAAQAAA+gAAAfQAAAADVNlcnZpY2VDZW50ZXIAAAA=",
        "AAAAAAAAAAAAAAASZ2V0X3RyYW5zZmVyX29mZmVyAAAAAAABAAAAAAAAAAd1bml0X2lkAAAAA+4AAAAgAAAAAQAAA+gAAAfQAAAADVRyYW5zZmVyT2ZmZXIAAAA=",
        "AAAAAAAAAF5Sb3RhdGVzIHRoZSBzaWduaW5nIGFkbWluIGtleSBmb3IgYW4gZXhpc3RpbmcgYnJhbmQgd2hpbGUga2VlcGluZyBpdHMgY2Fub25pY2FsIGJyYW5kIGFkZHJlc3MuAAAAAAAScm90YXRlX2JyYW5kX2FkbWluAAAAAAACAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAACW5ld19hZG1pbgAAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAAAAAAATZ2V0X3VuaXRfcmV0aXJlbWVudAAAAAABAAAAAAAAAAd1bml0X2lkAAAAA+4AAAAgAAAAAQAAA+gAAAfQAAAADlVuaXRSZXRpcmVtZW50AAA=",
        "AAAAAAAAAFJBZGRzIG9uZSBhdXRoZW50aWNhdGVkIGFkbWluIGFwcHJvdmFsIGFuZCBleGVjdXRlcyBvbmx5IHdoZW4gdGhlIHRocmVzaG9sZCBpcyBtZXQuAAAAAAAUYXBwcm92ZV9icmFuZF9hY3Rpb24AAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABWJyYW5kAAAAAAAAEwAAAAAAAAALcHJvcG9zYWxfaWQAAAAABAAAAAEAAAPpAAAAAQAAB9AAAAANUmVnaXN0cnlFcnJvcgAAAA==",
        "AAAAAAAAAFRQcm9wb3NlcyBhIHNlbnNpdGl2ZSBhY3Rpb24gYW5kIHJlY29yZHMgdGhlIGF1dGhlbnRpY2F0ZWQgcHJvcG9zZXIncyBmaXJzdCBhcHByb3ZhbC4AAAAUcHJvcG9zZV9icmFuZF9hY3Rpb24AAAADAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABWJyYW5kAAAAAAAAEwAAAAAAAAAGYWN0aW9uAAAAAAfQAAAAC0JyYW5kQWN0aW9uAAAAAAEAAAPpAAAABAAAB9AAAAANUmVnaXN0cnlFcnJvcgAAAA==",
        "AAAAAAAAAD1DYW5jZWxzIGFuIGFjdGl2ZSByZXNhbGUgdHJhbnNmZXIgb2ZmZXIgKGN1cnJlbnQgb3duZXIgb25seSkuAAAAAAAAFWNhbmNlbF90cmFuc2Zlcl9vZmZlcgAAAAAAAAEAAAAAAAAAB3VuaXRfaWQAAAAD7gAAACAAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAExDcmVhdGVzIGEgb25lLXRpbWUgcmVzYWxlIHRyYW5zZmVyIG9mZmVyIGF1dGhlbnRpY2F0ZWQgYnkgdGhlIGN1cnJlbnQgb3duZXIuAAAAFWNyZWF0ZV90cmFuc2Zlcl9vZmZlcgAAAAAAAAMAAAAAAAAAB3VuaXRfaWQAAAAD7gAAACAAAAAAAAAACWNvZGVfaGFzaAAAAAAAA+4AAAAgAAAAAAAAAApleHBpcmVzX2F0AAAAAAAGAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAAAAAAAVZ2V0X2JhdGNoX3JlY2FsbF9pbmZvAAAAAAAAAgAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAQAAA+gAAAfQAAAAClJlY2FsbEluZm8AAA==",
        "AAAAAAAAADVSZXZva2VzIGEgc2VydmljZSBjZW50ZXIncyBhdXRob3JpemF0aW9uIGZvciBhIGJyYW5kLgAAAAAAABVyZXZva2Vfc2VydmljZV9jZW50ZXIAAAAAAAACAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAADnNlcnZpY2VfY2VudGVyAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAFJDb25maWd1cmVzIGluaXRpYWwgdGhyZXNob2xkIGdvdmVybmFuY2U7IGxhdGVyIGNoYW5nZXMgcmVxdWlyZSBhbiBhcHByb3ZlZCBhY3Rpb24uAAAAAAAWY29uZmlndXJlX2JyYW5kX2FkbWlucwAAAAAAAgAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAAZjb25maWcAAAAAB9AAAAAQQnJhbmRBZG1pbkNvbmZpZwAAAAEAAAPpAAAAAgAAB9AAAAANUmVnaXN0cnlFcnJvcgAAAA==",
        "AAAAAAAAAEVSZXR1cm5zIHRoZSBpbW11dGFibGUgb3B0aW9uYWwgZG9jdW1lbnQgZGlnZXN0IGZvciBhIGNvbW1pdHRlZCBiYXRjaC4AAAAAAAAWZ2V0X2JhdGNoX21ldGFkYXRhX2NpZAAAAAAAAgAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAQAAA+gAAAPuAAAAIA==",
        "AAAAAAAAAAAAAAAWZ2V0X2JyYW5kX2FkbWluX2NvbmZpZwAAAAAAAQAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAQAAA+gAAAfQAAAAEEJyYW5kQWRtaW5Db25maWc=",
        "AAAAAAAAAH1BdXRob3JpemVzIGEgc2VydmljZSBjZW50ZXIsIGRlZmF1bHRpbmcgbmV3IGNlbnRlcnMgdG8gdGllciAzIGZvciBjb21wYXRpYmlsaXR5LgpSZWF1dGhvcml6YXRpb24gcHJlc2VydmVzIGl0cyBleGlzdGluZyB0aWVyLgAAAAAAABdyZWdpc3Rlcl9zZXJ2aWNlX2NlbnRlcgAAAAACAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAADnNlcnZpY2VfY2VudGVyAAAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAEdVcGRhdGVzIHRoZSBnbG9iYWwgcGVyLXVuaXQgd2FycmFudHkgY2xhaW0gbGltaXQgKHJlZ2lzdHJ5IGFkbWluIG9ubHkpLgAAAAAXc2V0X21heF9jbGFpbXNfcGVyX3VuaXQAAAAAAQAAAAAAAAAKbWF4X2NsYWltcwAAAAAABAAAAAEAAAPpAAAAAgAAB9AAAAANUmVnaXN0cnlFcnJvcgAAAA==",
        "AAAAAAAAAO9QZXJzaXN0cyBhIHZlcmlmaWVkIGR1cGxpY2F0ZSBhY3RpdmF0aW9uIGF0dGVtcHQgb24tY2hhaW4gd2hlbiBhbiBhbHJlYWR5LWNsYWltZWQgdW5pdCdzCnBoeXNpY2FsIHBhY2thZ2Ugc2VjcmV0IGlzIHN1Ym1pdHRlZCBhZ2FpbiwgaW5jcmVtZW50aW5nIGBkdXBsaWNhdGVfYXR0ZW1wdHNgIGFuZCBlbWl0dGluZwpgZHVwbGljYXRlX2F0dGVtcHRgIHdpdGhvdXQgcm9sbGluZyBiYWNrIHRyYW5zYWN0aW9uIHN0YXRlLgAAAAAYcmVwb3J0X2R1cGxpY2F0ZV9hdHRlbXB0AAAABgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAACGJhdGNoX2lkAAAD7gAAACAAAAAAAAAAC3NlcmlhbF9oYXNoAAAAA+4AAAAgAAAAAAAAAAVwcm9vZgAAAAAAA+oAAAPuAAAAIAAAAAAAAAAGc2VjcmV0AAAAAAAOAAAAAQAAA+kAAAAEAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAE9VcGRhdGVzIGFjY3JlZGl0YXRpb24gd2l0aG91dCByZWFjdGl2YXRpbmcgYSByZXZva2VkIGNlbnRlciAoYnJhbmQgYWRtaW4gb25seSkuAAAAABp1cGRhdGVfc2VydmljZV9jZW50ZXJfdGllcgAAAAAAAwAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAA5zZXJ2aWNlX2NlbnRlcgAAAAAAEwAAAAAAAAAIbmV3X3RpZXIAAAAEAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAQAAAAAAAAAAAAAABFVuaXQAAAALAAAAAAAAAAxhY3RpdmF0ZWRfYXQAAAAGAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAAC2NsYWltc191c2VkAAAAAAQAAAAAAAAAEmR1cGxpY2F0ZV9hdHRlbXB0cwAAAAAABAAAAAAAAAALaGlzdG9yeV9sZW4AAAAABAAAAAAAAAATbGFzdF90cmFuc2ZlcnJlZF9hdAAAAAAGAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAABnN0YXR1cwAAAAAH0AAAAApVbml0U3RhdHVzAAAAAAAAAAAADnRyYW5zZmVyX2NvdW50AAAAAAAEAAAAAAAAAA93YXJyYW50eV9leHBpcnkAAAAABg==",
        "AAAAAQAAAAAAAAAAAAAABUJhdGNoAAAAAAAADAAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAApleHBpcmVzX2F0AAAAAAPoAAAABgAAAAAAAAAGZnJvemVuAAAAAAABAAAARk5vbmUgYWxsb3dzIHRyYW5zZmVycyB3aXRob3V0IGEgYmF0Y2ggY2FwOyBTb21lKDApIGRpc2FibGVzIHRyYW5zZmVycy4AAAAAAA1tYXhfdHJhbnNmZXJzAAAAAAAD6AAAAAQAAAAAAAAAC21lcmtsZV9yb290AAAAA+4AAAAgAAAAAAAAAAxtZXRhZGF0YV9jaWQAAAPoAAAD7gAAACAAAAAAAAAAEXByb2R1Y3RfbWV0YV9oYXNoAAAAAAAD7gAAACAAAAAAAAAACHJlY2FsbGVkAAAAAQAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAC0JhdGNoU3RhdHVzAAAAAAAAAAAKdW5pdF9jb3VudAAAAAAABgAAAAAAAAAPd2FycmFudHlfbW9udGhzAAAAAAQ=",
        "AAAAAQAAAAAAAAAAAAAABUJyYW5kAAAAAAAABwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAxhZG1pbl9jb25maWcAAAfQAAAAEEJyYW5kQWRtaW5Db25maWcAAAAAAAAAEGFkbWluX2dlbmVyYXRpb24AAAAEAAAAAAAAAAZkb21haW4AAAAAABAAAAAAAAAADm5leHRfYWN0aW9uX2lkAAAAAAAEAAAAAAAAAA1yZWdpc3RlcmVkX2F0AAAAAAAABgAAAAAAAAAIdmVyaWZpZWQAAAAB",
        "AAAAAQAAAAAAAAAAAAAABUNsYWltAAAAAAAABgAAAAAAAAAIZmlsZWRfYXQAAAAGAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAHb3V0Y29tZQAAAAfQAAAADENsYWltT3V0Y29tZQAAAAAAAAALcmVwb3J0X2hhc2gAAAAD7gAAACAAAAAAAAAAC3Jlc29sdmVkX2F0AAAAAAYAAAAAAAAADnNlcnZpY2VfY2VudGVyAAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAABkNvbmZpZwAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABNtYXhfY2xhaW1zX3Blcl91bml0AAAAAAQ=",
        "AAAAAQAAAAAAAAAAAAAACFVuaXRWaWV3AAAADQAAAAAAAAAMYWN0aXZhdGVkX2F0AAAABgAAAAAAAAAIYmF0Y2hfaWQAAAPuAAAAIAAAAAAAAAAOYmF0Y2hfcmVjYWxsZWQAAAAAAAEAAAAAAAAABWJyYW5kAAAAAAAAEwAAAAAAAAALY2xhaW1zX3VzZWQAAAAABAAAAAAAAAASZHVwbGljYXRlX2F0dGVtcHRzAAAAAAAEAAAAAAAAAAtoaXN0b3J5X2xlbgAAAAAEAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAABnN0YXR1cwAAAAAH0AAAAApVbml0U3RhdHVzAAAAAAAAAAAADnRyYW5zZmVyX2NvdW50AAAAAAAEAAAAAAAAAAd1bml0X2lkAAAAA+4AAAAgAAAAAAAAAA93YXJyYW50eV9leHBpcnkAAAAABgAAAAAAAAAOd2FycmFudHlfdmFsaWQAAAAAAAE=",
        "AAAAAQAAAAAAAAAAAAAAClJlY2FsbEluZm8AAAAAAAMAAAAAAAAAC25vdGljZV9oYXNoAAAAA+4AAAAgAAAAAAAAAAtyZWNhbGxlZF9hdAAAAAAGAAAAizE6IGNyaXRpY2FsL2xpZmUgc2FmZXR5OyAyOiBmdW5jdGlvbmFsIGRlZmVjdDsgMzogY29zbWV0aWMvbGFiZWxpbmcuClNvcm9iYW4gcmVwcmVzZW50cyBzbWFsbCB1bnNpZ25lZCBpbnRlZ2VycyBhcyB1MzIgaW4gaXRzIGNvbnRyYWN0IEFCSS4AAAAACHNldmVyaXR5AAAABA==",
        "AAAAAwAAAAAAAAAAAAAAClVuaXRTdGF0dXMAAAAAAAQAAAAAAAAABkFjdGl2ZQAAAAAAAAAAAAAAAAAHRmxhZ2dlZAAAAAABAAAAAAAAAAhSZWNhbGxlZAAAAAIAAAAAAAAAB1JldGlyZWQAAAAAAw==",
        "AAAAAgAAAAAAAAAAAAAAC0JhdGNoU3RhdHVzAAAAAAMAAAAAAAAAAAAAAAZBY3RpdmUAAAAAAAAAAAAAAAAAB0V4cGlyZWQAAAAAAAAAAAAAAAAIUmVjYWxsZWQ=",
        "AAAAAgAAAAAAAAAAAAAAC0JyYW5kQWN0aW9uAAAAAAcAAAABAAAAAAAAAAtGcmVlemVCYXRjaAAAAAABAAAD7gAAACAAAAABAAAAAAAAAA1VbmZyZWV6ZUJhdGNoAAAAAAAAAQAAA+4AAAAgAAAAAQAAAAAAAAALUmVjYWxsQmF0Y2gAAAAAAwAAA+4AAAAgAAAABAAAA+4AAAAgAAAAAQAAAAAAAAAVUmVnaXN0ZXJTZXJ2aWNlQ2VudGVyAAAAAAAAAQAAABMAAAABAAAAAAAAABNSZXZva2VTZXJ2aWNlQ2VudGVyAAAAAAEAAAATAAAAAQAAAAAAAAAXVXBkYXRlU2VydmljZUNlbnRlclRpZXIAAAAAAgAAABMAAAAEAAAAAQAAAAAAAAAPQ29uZmlndXJlQWRtaW5zAAAAAAEAAAfQAAAAEEJyYW5kQWRtaW5Db25maWc=",
        "AAAAAwAAAAAAAAAAAAAADENsYWltT3V0Y29tZQAAAAUAAAAAAAAAB1BlbmRpbmcAAAAAAAAAAAAAAAAIQXBwcm92ZWQAAAABAAAAAAAAAAhSZWplY3RlZAAAAAIAAAAAAAAACFJlcGFpcmVkAAAAAwAAAAAAAAAIUmVwbGFjZWQAAAAE",
        "AAAAAQAAAAAAAAAAAAAADFZlcmlmeVJlc3VsdAAAAAwAAAAAAAAACWFjdGl2YXRlZAAAAAAAAAEAAAAAAAAADGFjdGl2YXRlZF9hdAAAAAYAAAAAAAAADmJhdGNoX3JlY2FsbGVkAAAAAAABAAAAAAAAAA5icmFuZF92ZXJpZmllZAAAAAAAAQAAAAAAAAALY2xhaW1zX3VzZWQAAAAABAAAAAAAAAASZHVwbGljYXRlX2F0dGVtcHRzAAAAAAAEAAAAAAAAAAVvd25lcgAAAAAAA+gAAAATAAAAAAAAAAtwcm9vZl92YWxpZAAAAAABAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAAMVmVyaWZ5U3RhdHVzAAAAAAAAAAd1bml0X2lkAAAAA+4AAAAgAAAAAAAAAA93YXJyYW50eV9leHBpcnkAAAAABgAAAAAAAAAOd2FycmFudHlfdmFsaWQAAAAAAAE=",
        "AAAAAwAAAAAAAAAAAAAADFZlcmlmeVN0YXR1cwAAAAYAAAAAAAAAB1Vua25vd24AAAAAAAAAAAAAAAARQXV0aGVudGljSW5hY3RpdmUAAAAAAAABAAAAAAAAAA9BdXRoZW50aWNBY3RpdmUAAAAAAgAAAAAAAAAHRmxhZ2dlZAAAAAADAAAAAAAAAAhSZWNhbGxlZAAAAAQAAAAAAAAAB1JldGlyZWQAAAAABQ==",
        "AAAABAAAAAAAAAAAAAAADVJlZ2lzdHJ5RXJyb3IAAAAAAAAcAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAAEAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAACAAAAAAAAAA1Ob3RBdXRob3JpemVkAAAAAAAAAwAAAAAAAAASQnJhbmRBbHJlYWR5RXhpc3RzAAAAAAAEAAAAAAAAAA1CcmFuZE5vdEZvdW5kAAAAAAAABQAAAAAAAAAQQnJhbmROb3RWZXJpZmllZAAAAAYAAAAAAAAAC0JhdGNoRXhpc3RzAAAAAAcAAAAAAAAADUJhdGNoTm90Rm91bmQAAAAAAAAIAAAAAAAAAAxJbnZhbGlkUHJvb2YAAAAJAAAAAAAAABRVbml0QWxyZWFkeUFjdGl2YXRlZAAAAAoAAAAAAAAADFVuaXROb3RGb3VuZAAAAAsAAAAAAAAAD1dhcnJhbnR5RXhwaXJlZAAAAAAMAAAAAAAAABFDbGFpbUxpbWl0UmVhY2hlZAAAAAAAAA0AAAAAAAAAFVRyYW5zZmVyT2ZmZXJOb3RGb3VuZAAAAAAAAA4AAAAAAAAAFFRyYW5zZmVyT2ZmZXJFeHBpcmVkAAAADwAAAAAAAAATSW52YWxpZFRyYW5zZmVyQ29kZQAAAAAQAAAAAAAAAAtVbml0RmxhZ2dlZAAAAAARAAAAAAAAAA1CYXRjaFJlY2FsbGVkAAAAAAAAEgAAAAAAAAAaU2VydmljZUNlbnRlck5vdEF1dGhvcml6ZWQAAAAAABMAAAAAAAAADUNsYWltTm90Rm91bmQAAAAAAAAUAAAAAAAAABRDbGFpbUFscmVhZHlSZXNvbHZlZAAAABUAAAAAAAAADEludmFsaWRJbnB1dAAAABYAAAAAAAAAC1VuaXRSZXRpcmVkAAAAABcAAAAAAAAADEJhdGNoRXhwaXJlZAAAABgAAAAAAAAAC0JhdGNoRnJvemVuAAAAABkAAAAAAAAAFlRyYW5zZmVyQ29vbGRvd25BY3RpdmUAAAAAABoAAAAAAAAAFFRyYW5zZmVyTGltaXRSZWFjaGVkAAAAGwAAAAAAAAAUV2FycmFudHlMaW1pdFJlYWNoZWQAAAAc",
        "AAAAAQAAAAAAAAAAAAAADVNlcnZpY2VDZW50ZXIAAAAAAAACAAAAAAAAAAZhY3RpdmUAAAAAAAEAAAAuMTogaW5zcGVjdGlvbjsgMjogcmVwYWlyOyAzOiBmdWxsIHJlcGxhY2VtZW50LgAAAAAABHRpZXIAAAAE",
        "AAAAAQAAAAAAAAAAAAAADVRyYW5zZmVyT2ZmZXIAAAAAAAADAAAAAAAAAAljb2RlX2hhc2gAAAAAAAPuAAAAIAAAAAAAAAAKY3JlYXRlZF9hdAAAAAAABgAAAAAAAAAKZXhwaXJlc19hdAAAAAAABg==",
        "AAAAAQAAAAAAAAAAAAAADlVuaXRSZXRpcmVtZW50AAAAAAAEAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACWNlcnRfaGFzaAAAAAAAA+4AAAAgAAAAAAAAAAtyZWFzb25fY29kZQAAAAAEAAAAAAAAAApyZXRpcmVkX2F0AAAAAAAG",
        "AAAAAQAAAAAAAAAAAAAAEEJyYW5kQWRtaW5Db25maWcAAAACAAAAAAAAAAZhZG1pbnMAAAAAA+oAAAATAAAAAAAAAAl0aHJlc2hvbGQAAAAAAAAE",
        "AAAAAQAAAAAAAAAAAAAAE0JyYW5kQWN0aW9uUHJvcG9zYWwAAAAABQAAAAAAAAAGYWN0aW9uAAAAAAfQAAAAC0JyYW5kQWN0aW9uAAAAAAAAAAAQYWRtaW5fZ2VuZXJhdGlvbgAAAAQAAAAAAAAACWFwcHJvdmFscwAAAAAAA+oAAAATAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACGV4ZWN1dGVkAAAAAQ==",
        "AAAABQAAAAAAAAAAAAAACkNsYWltRmlsZWQAAAAAAAEAAAALY2xhaW1fZmlsZWQAAAAAAwAAAAAAAAAHdW5pdF9pZAAAAAPuAAAAIAAAAAEAAAAAAAAACGNsYWltX2lkAAAABAAAAAAAAAAAAAAADnNlcnZpY2VfY2VudGVyAAAAAAATAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAC0JhdGNoRnJvemVuAAAAAAEAAAAMYmF0Y2hfZnJvemVuAAAAAgAAAAAAAAAFYnJhbmQAAAAAAAATAAAAAQAAAAAAAAAIYmF0Y2hfaWQAAAPuAAAAIAAAAAEAAAAC",
        "AAAABQAAAAAAAAAAAAAAC1VuaXRGbGFnZ2VkAAAAAAEAAAAMdW5pdF9mbGFnZ2VkAAAAAgAAAAAAAAAHdW5pdF9pZAAAAAPuAAAAIAAAAAEAAAAAAAAAC3JlYXNvbl9oYXNoAAAAA+4AAAAgAAAAAAAAAAI=",
        "AAAABQAAAAAAAAAAAAAAC1VuaXRSZXRpcmVkAAAAAAEAAAAMdW5pdF9yZXRpcmVkAAAABAAAAAAAAAAHdW5pdF9pZAAAAAPuAAAAIAAAAAEAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAAAAAAC3JlYXNvbl9jb2RlAAAAAAQAAAAAAAAAAAAAAAljZXJ0X2hhc2gAAAAAAAPuAAAAIAAAAAAAAAAC",
        "AAAABQAAAAAAAAAAAAAADUJhdGNoUmVjYWxsZWQAAAAAAAABAAAADmJhdGNoX3JlY2FsbGVkAAAAAAAFAAAAAAAAAAVicmFuZAAAAAAAABMAAAABAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAQAAAAAAAAAIc2V2ZXJpdHkAAAAEAAAAAAAAAAAAAAALbm90aWNlX2hhc2gAAAAD7gAAACAAAAAAAAAAM01pcnJvcnMgbm90aWNlX2hhc2ggZm9yIGV4aXN0aW5nIGluZGV4ZXIgY29uc3VtZXJzLgAAAAALcmVhc29uX2hhc2gAAAAD7gAAACAAAAAAAAAAAg==",
        "AAAABQAAAAAAAAAAAAAADUJhdGNoVW5mcm96ZW4AAAAAAAABAAAADmJhdGNoX3VuZnJvemVuAAAAAAACAAAAAAAAAAVicmFuZAAAAAAAABMAAAABAAAAAAAAAAhiYXRjaF9pZAAAA+4AAAAgAAAAAQAAAAI=",
        "AAAABQAAAAAAAAAAAAAADUJyYW5kVmVyaWZpZWQAAAAAAAABAAAADmJyYW5kX3ZlcmlmaWVkAAAAAAABAAAAAAAAAAVicmFuZAAAAAAAABMAAAABAAAAAg==",
        "AAAABQAAAAAAAAAAAAAADUNsYWltUmVzb2x2ZWQAAAAAAAABAAAADmNsYWltX3Jlc29sdmVkAAAAAAAEAAAAAAAAAAd1bml0X2lkAAAAA+4AAAAgAAAAAQAAAAAAAAAIY2xhaW1faWQAAAAEAAAAAAAAAAAAAAAHb3V0Y29tZQAAAAfQAAAADENsYWltT3V0Y29tZQAAAAAAAAAAAAAAC3JlcG9ydF9oYXNoAAAAA+4AAAAgAAAAAAAAAAI=",
        "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",
        "AAAAAQAAAD5TdG9yYWdlIGxheW91dCB1c2VkIGJlZm9yZSBvcHRpb25hbCBleHBpcmF0aW9uIHdhcyBpbnRyb2R1Y2VkLgAAAAAAAAAAAAtMZWdhY3lCYXRjaAAAAAAHAAAAAAAAAAVicmFuZAAAAAAAABMAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAYAAAAAAAAAC21lcmtsZV9yb290AAAAA+4AAAAgAAAAAAAAABFwcm9kdWN0X21ldGFfaGFzaAAAAAAAA+4AAAAgAAAAAAAAAAhyZWNhbGxlZAAAAAEAAAAAAAAACnVuaXRfY291bnQAAAAAAAYAAAAAAAAAD3dhcnJhbnR5X21vbnRocwAAAAAE",
        "AAAAAQAAAD9TdG9yYWdlIGxheW91dCB1c2VkIGJlZm9yZSB0aHJlc2hvbGQgZ292ZXJuYW5jZSB3YXMgaW50cm9kdWNlZC4AAAAAAAAAAAtMZWdhY3lCcmFuZAAAAAAEAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABmRvbWFpbgAAAAAAEAAAAAAAAAANcmVnaXN0ZXJlZF9hdAAAAAAAAAYAAAAAAAAACHZlcmlmaWVkAAAAAQ==" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<Result<void>>,
        activate: this.txFromJSON<Result<Buffer>>,
        get_unit: this.txFromJSON<Option<UnitView>>,
        flag_unit: this.txFromJSON<Result<void>>,
        get_batch: this.txFromJSON<Option<Batch>>,
        get_brand: this.txFromJSON<Option<Brand>>,
        get_claim: this.txFromJSON<Option<Claim>>,
        file_claim: this.txFromJSON<Result<u32>>,
        get_config: this.txFromJSON<Option<Config>>,
        retire_unit: this.txFromJSON<Result<void>>,
        commit_batch: this.txFromJSON<Result<void>>,
        freeze_batch: this.txFromJSON<Result<void>>,
        recall_batch: this.txFromJSON<Result<void>>,
        rotate_admin: this.txFromJSON<Result<void>>,
        verify_brand: this.txFromJSON<Result<void>>,
        bump_unit_ttl: this.txFromJSON<Result<void>>,
        resolve_claim: this.txFromJSON<Result<void>>,
        verify_serial: this.txFromJSON<VerifyResult>,
        bump_batch_ttl: this.txFromJSON<Result<void>>,
        register_brand: this.txFromJSON<Result<void>>,
        unfreeze_batch: this.txFromJSON<Result<void>>,
        compute_unit_id: this.txFromJSON<Buffer>,
        extend_warranty: this.txFromJSON<Result<u64>>,
        redeem_transfer: this.txFromJSON<Result<void>>,
        get_brand_action: this.txFromJSON<Option<BrandActionProposal>>,
        is_service_center: this.txFromJSON<boolean>,
        is_warranty_valid: this.txFromJSON<boolean>,
        set_max_transfers: this.txFromJSON<Result<void>>,
        get_service_center: this.txFromJSON<Option<ServiceCenter>>,
        get_transfer_offer: this.txFromJSON<Option<TransferOffer>>,
        rotate_brand_admin: this.txFromJSON<Result<void>>,
        get_unit_retirement: this.txFromJSON<Option<UnitRetirement>>,
        approve_brand_action: this.txFromJSON<Result<boolean>>,
        propose_brand_action: this.txFromJSON<Result<u32>>,
        cancel_transfer_offer: this.txFromJSON<Result<void>>,
        create_transfer_offer: this.txFromJSON<Result<void>>,
        get_batch_recall_info: this.txFromJSON<Option<RecallInfo>>,
        revoke_service_center: this.txFromJSON<Result<void>>,
        configure_brand_admins: this.txFromJSON<Result<void>>,
        get_batch_metadata_cid: this.txFromJSON<Option<Buffer>>,
        get_brand_admin_config: this.txFromJSON<Option<BrandAdminConfig>>,
        register_service_center: this.txFromJSON<Result<void>>,
        set_max_claims_per_unit: this.txFromJSON<Result<void>>,
        report_duplicate_attempt: this.txFromJSON<Result<u32>>,
        update_service_center_tier: this.txFromJSON<Result<void>>
  }
}