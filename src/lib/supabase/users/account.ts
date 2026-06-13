import { i18n } from '../../../i18n';
import { signOutFromApp } from '../auth/signOut';
import { getSupabaseClient } from '../client';

export class DeleteAccountError extends Error {
  constructor(
    message: string,
    readonly code: 'RPC_MISSING' | 'RPC_FAILED' | 'INCOMPLETE' | 'SIGN_OUT_FAILED',
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'DeleteAccountError';
  }
}

async function assertUserProfileRemoved(userId: string) {
  const { data, error } = await getSupabaseClient()
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new DeleteAccountError(
      i18n.t('errors.deleteAccount.verifyFailed'),
      'INCOMPLETE',
      error,
    );
  }

  if (data) {
    throw new DeleteAccountError(
      i18n.t('errors.deleteAccount.dataNotRemoved'),
      'INCOMPLETE',
    );
  }
}

export async function deleteUserAccount(userId: string) {
  const supabase = getSupabaseClient();

  const { error: rpcError } = await supabase.rpc('delete_user_account');

  if (rpcError) {
    if (rpcError.code === 'PGRST202') {
      throw new DeleteAccountError(
        i18n.t('errors.deleteAccount.rpcMissing'),
        'RPC_MISSING',
        rpcError,
      );
    }

    throw new DeleteAccountError(
      i18n.t('errors.deleteAccount.rpcFailed'),
      'RPC_FAILED',
      rpcError,
    );
  }

  await assertUserProfileRemoved(userId);

  try {
    await signOutFromApp();
  } catch (signOutError) {
    throw new DeleteAccountError(
      i18n.t('errors.deleteAccount.signOutAfterDelete'),
      'SIGN_OUT_FAILED',
      signOutError,
    );
  }
}
