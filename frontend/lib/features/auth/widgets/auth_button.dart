import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';


class AuthButton extends StatelessWidget {

  final String text;
  final VoidCallback onPressed;


  const AuthButton({
    super.key,
    required this.text,
    required this.onPressed,
  });


  @override
  Widget build(BuildContext context) {

    return SizedBox(

      width: double.infinity,

      height: 55,

      child: ElevatedButton(

        onPressed: onPressed,

        style: ElevatedButton.styleFrom(

          backgroundColor: AppColors.primary,

          foregroundColor: Colors.white,

          shape: RoundedRectangleBorder(

            borderRadius:
                BorderRadius.circular(15),

          ),

          elevation: 2,

        ),

        child: Text(

          text,

          style: const TextStyle(

            fontSize: 17,

            fontWeight: FontWeight.bold,

          ),

        ),

      ),

    );

  }

}