import 'dart:io';

import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

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
      // Some routes return a machine-readable `error` code plus a
      // human-readable `message` (e.g. class booking) — prefer the
      // message for display when present.
      final errorText = (body['message'] ?? body['error'])?.toString();
      return ApiResult(ok: ok, error: errorText, data: body);
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

  Future<ApiResult> _patch(String path, [Map<String, dynamic>? body]) async {
    try {
      final res = await _dio.patch(path, data: body);
      return _fromResponse(res);
    } catch (e) {
      return ApiResult(ok: false, error: 'Network error — please check your connection.');
    }
  }

  Future<ApiResult> _delete(String path) async {
    try {
      final res = await _dio.delete(path);
      return _fromResponse(res);
    } catch (e) {
      return ApiResult(ok: false, error: 'Network error — please check your connection.');
    }
  }

  // Persists which portal the last successful login used, so the app knows
  // which /api/*/me to check first on cold start instead of guessing.
  Future<void> saveLoginMode(String mode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('login_mode', mode);
  }

  Future<String> getLoginMode() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('login_mode') ?? 'member';
  }

  Future<ApiResult> requestOtp(String phone) => _post('/api/member-auth/request-otp', {'phone': phone});

  Future<ApiResult> verifyOtp(String phone, String code) =>
      _post('/api/member-auth/verify-otp', {'phone': phone, 'code': code});

  Future<ApiResult> logout() => _post('/api/member-auth/logout');

  Future<ApiResult> requestTrainerOtp(String phone) => _post('/api/trainer-auth/request-otp', {'phone': phone});

  Future<ApiResult> verifyTrainerOtp(String phone, String code) =>
      _post('/api/trainer-auth/verify-otp', {'phone': phone, 'code': code});

  Future<ApiResult> trainerLogout() => _post('/api/trainer-auth/logout');

  Future<ApiResult> getTrainerMe() => _get('/api/trainer/me');

  Future<ApiResult> getTrainerClients() => _get('/api/trainer/clients');

  Future<ApiResult> getTrainerClientDetail(String memberId) => _get('/api/trainer/clients/$memberId');

  Future<ApiResult> getMealPlans() => _get('/api/trainer/meal-plans');

  Future<ApiResult> getMealPlanDetail(String planId) => _get('/api/trainer/meal-plans/$planId');

  Future<ApiResult> createMealPlan(Map<String, dynamic> body) => _post('/api/trainer/meal-plans', body);

  Future<ApiResult> updateMealPlan(String planId, Map<String, dynamic> body) =>
      _patch('/api/trainer/meal-plans/$planId', body);

  Future<ApiResult> deleteMealPlan(String planId) => _delete('/api/trainer/meal-plans/$planId');

  Future<ApiResult> getWorkoutPlans() => _get('/api/trainer/workout-plans');

  Future<ApiResult> getWorkoutPlanDetail(String planId) => _get('/api/trainer/workout-plans/$planId');

  Future<ApiResult> createWorkoutPlan(Map<String, dynamic> body) => _post('/api/trainer/workout-plans', body);

  Future<ApiResult> updateWorkoutPlan(String planId, Map<String, dynamic> body) =>
      _patch('/api/trainer/workout-plans/$planId', body);

  Future<ApiResult> deleteWorkoutPlan(String planId) => _delete('/api/trainer/workout-plans/$planId');

  Future<ApiResult> assignMealPlan(String memberId, String mealPlanId, String startDate) =>
      _post('/api/trainer/assignments', {'member_id': memberId, 'meal_plan_id': mealPlanId, 'start_date': startDate});

  Future<ApiResult> endMealPlanAssignment(String assignmentId) =>
      _patch('/api/trainer/assignments/$assignmentId', {'is_active': false});

  Future<ApiResult> assignWorkoutPlan(String memberId, String workoutPlanId, String startDate) => _post(
      '/api/trainer/workout-assignments', {'member_id': memberId, 'workout_plan_id': workoutPlanId, 'start_date': startDate});

  Future<ApiResult> endWorkoutPlanAssignment(String assignmentId) =>
      _patch('/api/trainer/workout-assignments/$assignmentId', {'is_active': false});

  Future<ApiResult> getMe() => _get('/api/portal/me');

  Future<ApiResult> checkin() => _post('/api/member/checkin');

  Future<ApiResult> getNutrition() => _get('/api/portal/nutrition');

  Future<ApiResult> getWorkouts() => _get('/api/portal/workouts');

  Future<ApiResult> requestFreeze(String? reason) => _post('/api/portal/freeze', {'reason': reason});

  Future<ApiResult> getBookableClasses() => _get('/api/portal/classes');

  Future<ApiResult> bookClass(String classId, String date) =>
      _post('/api/portal/classes/book', {'class_id': classId, 'date': date});

  Future<ApiResult> cancelClass(String classId, String date) =>
      _post('/api/portal/classes/cancel', {'class_id': classId, 'date': date});

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

  Future<ApiResult> submitFacilityReport({String? description, bool urgent = false, File? photo}) async {
    try {
      final form = FormData.fromMap({
        'description': ?description,
        'severity': urgent ? 'urgent' : 'normal',
        if (photo != null) 'file': await MultipartFile.fromFile(photo.path, filename: photo.path.split('/').last),
      });
      final res = await _dio.post('/api/portal/facility-report', data: form);
      return _fromResponse(res);
    } catch (e) {
      return ApiResult(ok: false, error: 'Could not submit the report.');
    }
  }
}
