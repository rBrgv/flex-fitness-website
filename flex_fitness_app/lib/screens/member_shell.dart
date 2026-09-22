import 'package:flutter/material.dart';

import '../main.dart';
import 'classes_screen.dart';
import 'home_screen.dart';
import 'nutrition_screen.dart';
import 'progress_screen.dart';
import 'workouts_screen.dart';

// Persistent bottom tab bar, matching the website's PortalNav.tsx (same
// icons/labels/order). Each tab is one of the existing full-screen
// widgets (own Scaffold + AppBar) — nesting them in an IndexedStack works
// as-is in Flutter, so none of them needed to change.
class MemberShell extends StatefulWidget {
  const MemberShell({super.key});

  @override
  State<MemberShell> createState() => _MemberShellState();
}

const _tabGlyphs = ['⌂', '▤', '◆', '◎', '↗'];
const _tabLabels = ['Home', 'Classes', 'Workouts', 'Nutrition', 'Progress'];

class _MemberShellState extends State<MemberShell> {
  int _index = 0;

  void _goToClasses() => setState(() => _index = 1);

  @override
  Widget build(BuildContext context) {
    final tabs = [
      HomeScreen(onGoToClasses: _goToClasses),
      const ClassesScreen(),
      const WorkoutsScreen(),
      const NutritionScreen(),
      const ProgressScreen(),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: tabs),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        backgroundColor: kPanel,
        selectedItemColor: kGold,
        unselectedItemColor: kMuted,
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        // BottomNavigationBarItem's selected/unselected colors are only
        // applied automatically to Icon widgets (via IconTheme) — a plain
        // Text glyph needs its color set explicitly per tab here instead.
        items: List.generate(_tabGlyphs.length, (i) {
          final selected = i == _index;
          return BottomNavigationBarItem(
            icon: Text(_tabGlyphs[i], style: TextStyle(fontSize: 20, color: selected ? kGold : kMuted)),
            label: _tabLabels[i],
          );
        }),
      ),
    );
  }
}
