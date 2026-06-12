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
      '탈퇴 확인 중 오류가 발생했습니다.',
      'INCOMPLETE',
      error,
    );
  }

  if (data) {
    throw new DeleteAccountError(
      '계정 데이터가 삭제되지 않았습니다. delete_user_account RPC를 적용했는지 확인해주세요.',
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
        '탈퇴 기능이 아직 서버에 설정되지 않았습니다.',
        'RPC_MISSING',
        rpcError,
      );
    }

    throw new DeleteAccountError(
      '회원 탈퇴 처리에 실패했습니다.',
      'RPC_FAILED',
      rpcError,
    );
  }

  await assertUserProfileRemoved(userId);

  try {
    await signOutFromApp();
  } catch (signOutError) {
    throw new DeleteAccountError(
      '데이터는 삭제됐지만 로그아웃에 실패했습니다. 앱을 다시 실행해주세요.',
      'SIGN_OUT_FAILED',
      signOutError,
    );
  }
}
