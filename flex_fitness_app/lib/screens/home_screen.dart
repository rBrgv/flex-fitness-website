import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../api_client.dart';
import '../main.dart';
import 'classes_screen.dart';
import 'login_screen.dart';
import 'nutrition_screen.dart';
import 'progress_screen.dart';

const _statusLabels = {'active': 'Active', 'frozen': 'Frozen', 'cancelled': 'Cancelled'};

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  String _checkinState = 'idle'; // idle | loading | done | already

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getMe();
    setState(() {
      _data = res.ok ? res.data : null;
      _loading = false;
    });
  }

  Future<void> _checkin() async {
    setState(() => _checkinState = 'loading');
    final res = await ApiClient.instance.checkin();
    setState(() {
      _checkinState = (res.data['alreadyCheckedIn'] == true) ? 'already' : 'done';
    });
  }

  Future<void> _logout() async {
    await ApiClient.instance.logout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  String _fmtDate(String iso) {
    try {
      return DateFormat('d MMM yyyy').format(DateTime.parse(iso));
    } catch (_) {
      return iso;
    }
  }

  String _fmtTime(String hhmm) {
    final parts = hhmm.split(':');
    final h = int.parse(parts[0]);
    final m = parts[1];
    final period = h >= 12 ? 'PM' : 'AM';
    final h12 = h % 12 == 0 ? 12 : h % 12;
    return '$h12:$m $period';
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: kGold)));
    }
    if (_data == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Session expired', style: TextStyle(color: kInk)),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _logout, child: const Text('Log in again')),
            ],
          ),
        ),
      );
    }

    final member = _data!['member'] as Map<String, dynamic>;
    final trainerName = _data!['trainer_name'] as String?;
    final bookings = (_data!['bookings'] as List).cast<Map<String, dynamic>>();
    final attendance = (_data!['attendance'] as List).cast<Map<String, dynamic>>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Flex Fitness'),
        actions: [IconButton(onPressed: _logout, icon: const Icon(Icons.logout))],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        color: kGold,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Hi, ${(member['name'] as String).split(' ').first}', style: const TextStyle(color: kInk, fontSize: 22, fontWeight: FontWeight.bold)),
            Text(member['phone'], style: const TextStyle(color: kMuted, fontSize: 13)),
            const SizedBox(height: 16),

            _Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('MEMBERSHIP', style: TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: kGold.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(20)),
                        child: Text(_statusLabels[member['status']] ?? member['status'], style: const TextStyle(color: kGold, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(member['membership_plan'] ?? '—', style: const TextStyle(color: kInk, fontSize: 16, fontWeight: FontWeight.bold)),
                  if (member['plan_end_date'] != null) Text('Expires ${_fmtDate(member['plan_end_date'])}', style: const TextStyle(color: kMuted, fontSize: 13)),
                  if (trainerName != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text('Trainer: $trainerName', style: const TextStyle(color: kMuted, fontSize: 13))),
                ],
              ),
            ),

            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _NavCard(
                    label: 'Book a Class',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ClassesScreen())),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _NavCard(
                    label: 'Nutrition Plan',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const NutritionScreen())),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _NavCard(
                    label: 'Progress',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ProgressScreen())),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),
            _Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('TODAY', style: TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: (_checkinState == 'idle') ? _checkin : null,
                      child: Text(switch (_checkinState) {
                        'loading' => 'Checking in…',
                        'done' => '✓ Checked in',
                        'already' => '✓ Already checked in today',
                        _ => 'Check in',
                      }),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),
            _Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('UPCOMING CLASSES', style: TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  const SizedBox(height: 10),
                  if (bookings.isEmpty)
                    GestureDetector(
                      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ClassesScreen())),
                      child: const Text.rich(
                        TextSpan(children: [
                          TextSpan(text: 'No upcoming bookings. ', style: TextStyle(color: kMuted, fontSize: 13)),
                          TextSpan(text: 'Book a class →', style: TextStyle(color: kGold, fontSize: 13, fontWeight: FontWeight.bold)),
                        ]),
                      ),
                    )
                  else
                    ...bookings.map((b) {
                      final cls = b['classes'] as Map<String, dynamic>?;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(cls?['name'] ?? '', style: const TextStyle(color: kInk, fontWeight: FontWeight.bold, fontSize: 14)),
                                if (cls != null) Text('${_fmtTime(cls['start_time'])}–${_fmtTime(cls['end_time'])}', style: const TextStyle(color: kMuted, fontSize: 12)),
                              ],
                            ),
                            Text(_fmtDate(b['class_date']), style: const TextStyle(color: kMuted, fontSize: 12)),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),

            const SizedBox(height: 12),
            _Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('RECENT ATTENDANCE', style: TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  const SizedBox(height: 10),
                  if (attendance.isEmpty)
                    const Text('No check-ins logged yet.', style: TextStyle(color: kMuted, fontSize: 13))
                  else
                    ...attendance.map((a) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text(DateFormat('d MMM, h:mm a').format(DateTime.parse(a['checked_in_at']).toLocal()), style: const TextStyle(color: kInk, fontSize: 13)),
                        )),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Card extends StatelessWidget {
  final Widget child;
  const _Card({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
      child: child,
    );
  }
}

class _NavCard extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _NavCard({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        alignment: Alignment.center,
        decoration: BoxDecoration(color: kPanel, borderRadius: BorderRadius.circular(16), border: Border.all(color: kLine)),
        child: Text(label, style: const TextStyle(color: kInk, fontWeight: FontWeight.bold, fontSize: 13)),
      ),
    );
  }
}
