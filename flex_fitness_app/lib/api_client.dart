import 'dart:io';

import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';

// Same server the website (flex-fitness-website) talks to — this app is a
// thin client over its existing API routes, not a separate backend.
const String kBaseUrl = 'https://flex-fitness-website.vercel.app';

class ApiResult {
  final bool ok;
  final String? error;
  final Map<String, dynamic> data;
  ApiResult({required this.ok, this.error, this.data = const {}});
}

// One shared client for the whole app. The cookie jar persists flex_session
// across restarts exactly like a browser would — no token handling needed,
// the website's existing cookie-based auth just works unchanged.
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  late final Dio _dio;
  bool _ready = false;

  Future<void> init() async {
    if (_ready) return;
    final dir = await getApplicationDocumentsDirectory();
    final cookieJar = PersistCookieJar(storage: FileStorage('${dir.path}/.cookies'));
    _dio = Dio(BaseOptions(baseUrl: kBaseUrl, validateStatus: (_) => true));
    _dio.interceptors.add(CookieManager(cookieJar));
    _ready = true;
  }

  ApiResult _fromResponse(Response res) {
    final body = res.data;
    if (body is Map<String, dynamic>) {
      final ok = body['ok'] == true;
      return ApiResult(ok: ok, error: body['error']?.toString(), data: body);
    }
    return ApiResult(ok: res.statusCode != null && res.statusCode! < 300, data: const {});
  }

  Future<ApiResult> _post(String path, [Map<String, dynamic>? body]) async {
    try {
      final res = await _dio.post(path, data: body);
      return _fromResponse(res);
    } catch (e) {
      return ApiResult(ok: false, error: 'Network error — please check your connection.');
    }
  }

  Future<ApiResult> _get(String path) async {
    try {
      final res = await _dio.get(path);
      return _fromResponse(res);
    } catch (e) {
      return ApiResult(ok: false, error: 'Network error — please check your connection.');
    }
  }

  Future<ApiResult> requestOtp(String phone) => _post('/api/member-auth/request-otp', {'phone': phone});

  Future<ApiResult> verifyOtp(String phone, String code) =>
      _post('/api/member-auth/verify-otp', {'phone': phone, 'code': code});

  Future<ApiResult> logout() => _post('/api/member-auth/logout');

  Future<ApiResult> getMe() => _get('/api/portal/me');

  Future<ApiResult> checkin() => _post('/api/member/checkin');

  Future<ApiResult> getNutrition() => _get('/api/portal/nutrition');

  Future<ApiResult> getProgress() => _get('/api/portal/progress');

  Future<ApiResult> saveMeasurement(Map<String, dynamic> body) =>
      _post('/api/member/progress/measurements', body);

  Future<ApiResult> uploadPhoto(File file, {required String viewType, required String date, bool isMilestone = false}) async {
    try {
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(file.path, filename: file.path.split('/').last),
        'view_type': viewType,
        'date': date,
        'is_milestone': isMilestone.toString(),
      });
      final res = await _dio.post('/api/member/progress/photos', data: form);
      return _fromResponse(res);
    } catch (e) {
      return ApiResult(ok: false, error: 'Could not upload the photo.');
    }
  }
}
