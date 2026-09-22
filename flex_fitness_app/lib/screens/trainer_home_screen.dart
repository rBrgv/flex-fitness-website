import 'package:flutter/material.dart';

import '../api_client.dart';
import '../main.dart';
import 'login_screen.dart';
import 'trainer_clients_screen.dart';
import 'trainer_meal_plans_screen.dart';
import 'trainer_workout_plans_screen.dart';

const _dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

class TrainerHomeScreen extends StatefulWidget {
  const TrainerHomeScreen({super.key});

  @override
  State<TrainerHomeScreen> createState() => _TrainerHomeScreenState();
}

class _TrainerHomeScreenState extends State<TrainerHomeScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await ApiClient.instance.getTrainerMe();
    setState(() {
      _data = res.ok ? res.data : null;
      _loading = false;
    });
  }

  Future<void> _logout() async {
    await ApiClient.instance.trainerLogout();
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
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

    final trainer = _data!['trainer'] as Map<String, dynamic>;
    final sessions = (_data!['sessions'] as List).cast<Map<String, dynamic>>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Flex Fitness — Trainer'),
        actions: [IconButton(onPressed: _logout, icon: const Icon(Icons.logout))],
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        color: kGold,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('Hi, ${trainer['name']}', style: const TextStyle(color: kInk, fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _NavCard(
                    label: 'My Clients',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TrainerClientsScreen())),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _NavCard(
                    label: 'Meal Templates',
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TrainerMealPlansScreen())),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _NavCard(
              label: 'Workout Plan Templates',
              onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TrainerWorkoutPlansScreen())),
            ),
            const SizedBox(height: 16),
            _Card(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('THIS WEEK', style: TextStyle(color: kMuted, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  const SizedBox(height: 10),
                  if (sessions.isEmpty)
                    const Text('No classes assigned to you right now.', style: TextStyle(color: kMuted, fontSize: 13))
                  else
                    ...sessions.map((s) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(s['name'], style: const TextStyle(color: kInk, fontWeight: FontWeight.bold, fontSize: 14)),
                                  Text(
                                    '${_dayNames[s['day_of_week']]} · ${_fmtTime(s['start_time'])}–${_fmtTime(s['end_time'])}',
                                    style: const TextStyle(color: kMuted, fontSize: 12),
                                  ),
                                ],
                              ),
                              Text('${s['booking_count']} bookings', style: const TextStyle(color: kGold, fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          ),
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
        child: Text(label, style: const TextStyle(color: kInk, fontWeight: FontWeight.bold, fontSize: 13), textAlign: TextAlign.center),
      ),
    );
  }
}
