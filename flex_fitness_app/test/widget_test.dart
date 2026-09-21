import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:flex_fitness_app/main.dart';

void main() {
  testWidgets('App boots and shows a loading state before session check resolves', (WidgetTester tester) async {
    await tester.pumpWidget(const FlexFitnessApp());
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
