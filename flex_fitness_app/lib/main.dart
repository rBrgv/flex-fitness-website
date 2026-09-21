import 'package:flutter/material.dart';

import 'api_client.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

// Exact brand colors from flex-fitness-website/app/globals.css — same look
// as the web portal.
const kPaper = Color(0xFF0A0908);
const kPanel = Color(0xFF17140F);
const kLine = Color(0xFF2C2820);
const kInk = Color(0xFFF5F1E8);
const kMuted = Color(0xFFA39C8C);
const kGold = Color(0xFFE8A93D);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiClient.instance.init();
  runApp(const FlexFitnessApp());
}

class FlexFitnessApp extends StatelessWidget {
  const FlexFitnessApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flex Fitness',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: kPaper,
        colorScheme: ColorScheme.dark(
          primary: kGold,
          secondary: kGold,
          surface: kPanel,
          onSurface: kInk,
        ),
        cardColor: kPanel,
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: kInk),
          bodyLarge: TextStyle(color: kInk),
        ),
        appBarTheme: const AppBarTheme(backgroundColor: kPaper, foregroundColor: kInk, elevation: 0),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: kGold,
            foregroundColor: kPaper,
            textStyle: const TextStyle(fontWeight: FontWeight.bold),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: kPanel,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: kLine)),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: kLine)),
        ),
      ),
      home: const SessionGate(),
    );
  }
}

// Decides whether to show the login flow or jump straight to the home
// screen, based on whether the persisted flex_session cookie still works.
class SessionGate extends StatefulWidget {
  const SessionGate({super.key});

  @override
  State<SessionGate> createState() => _SessionGateState();
}

class _SessionGateState extends State<SessionGate> {
  bool _checked = false;
  bool _loggedIn = false;

  @override
  void initState() {
    super.initState();
    _check();
  }

  Future<void> _check() async {
    final res = await ApiClient.instance.getMe();
    setState(() {
      _loggedIn = res.ok;
      _checked = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_checked) {
      return const Scaffold(body: Center(child: CircularProgressIndicator(color: kGold)));
    }
    return _loggedIn ? const HomeScreen() : const LoginScreen();
  }
}
